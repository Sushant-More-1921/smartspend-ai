import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;
    const data = payload?.data;

    if (!eventType || !data) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, first_name, last_name, image_url, email_addresses, username } = data;

      const firstName = first_name || "";
      const lastName = last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const primaryEmail =
        email_addresses?.[0]?.email_address ||
        data?.primary_email_address_id ||
        "";
      const name =
        fullName ||
        username ||
        (primaryEmail ? primaryEmail.split("@")[0] : "User");

      // Check if user exists by clerkUserId or email
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { clerkUserId: id },
            ...(primaryEmail ? [{ email: primaryEmail }] : []),
          ],
        },
      });

      if (existingUser) {
        await db.user.update({
          where: { id: existingUser.id },
          data: {
            clerkUserId: id,
            name: name || existingUser.name,
            imageUrl: image_url || existingUser.imageUrl,
            ...(primaryEmail ? { email: primaryEmail } : {}),
          },
        });
      } else {
        await db.user.create({
          data: {
            clerkUserId: id,
            name,
            imageUrl: image_url || null,
            email: primaryEmail,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `User ${id} synchronized successfully`,
      });
    }

    if (eventType === "user.deleted") {
      const { id } = data;
      const user = await db.user.findUnique({
        where: { clerkUserId: id },
      });

      if (user) {
        await db.user.delete({
          where: { id: user.id },
        });
      }

      return NextResponse.json({
        success: true,
        message: `User ${id} deleted successfully`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ignored unhandled event: ${eventType}`,
    });
  } catch (error) {
    console.error("Clerk Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Clerk webhook" },
      { status: 500 }
    );
  }
}
