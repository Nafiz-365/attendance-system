

import { prisma } from "@/lib/prisma";

export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" = "INFO"
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}
