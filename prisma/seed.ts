
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Cleanup
    console.log('🧹 Cleaning up database...');
    await prisma.attendance.deleteMany();
    await prisma.classRoutine.deleteMany();
    await prisma.subjectAllocation.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.academicSession.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();


    // 2. Create Admin
    console.log('👤 Creating Admin...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@university.edu',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    // 3. Create Departments
    console.log('🏢 Creating Departments...');
    const cseDept = await prisma.department.create({
        data: {
            name: 'Computer Science & Engineering',
            code: 'CSE',
            hod: 'Dr. Head',
            userId: adminUser.id, // Admin manages dept
        },
    });

    const eeeDept = await prisma.department.create({
        data: {
            name: 'Electrical & Electronic Engineering',
            code: 'EEE',
            hod: 'Dr. Electric',
            userId: adminUser.id,
        },
    });

    // 4. Create Academic Session
    console.log('📅 Creating Academic Session...');
    const activeSession = await prisma.academicSession.create({
        data: {
            name: 'Spring 2025',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-06-30'),
            isActive: true, // IMPORTANT
        },
    });

    // 5. Minimal State: No dummy data
    console.log('✅ Clean Slate Reset! Ready for manual data entry.');
    console.log('-------------------------------------------');
    console.log('Admin:   admin@university.edu / password123');
    console.log('-------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
