
 
import { PrismaClient } from "@prisma/client";
import { createNotification } from "../lib/notifications";

const prisma = new PrismaClient();

async function main() {
    // Find a user (e.g., admin or first user)
    const user = await prisma.user.findFirst();

    if (!user) {
        console.log("No users found to send notification to.");
        return;
    }

    console.log(`Sending test notification to User: ${user.name} (${user.email})`);

    const notification = await createNotification(
        user.id,
        "Test Notification",
        `This is a test alert sent at ${new Date().toLocaleTimeString()}`,
        "SUCCESS"
    );

    if (notification) {
        console.log("Notification created successfully:", notification);
    } else {
        console.log("Failed to create notification.");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
