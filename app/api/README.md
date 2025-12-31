# Backend API Structure

This folder contains the backend API routes for the Varsity Attendance System.

## 📁 Structure

```
app/api/
├── students/route.ts       # Student CRUD endpoints
├── departments/route.ts    # Department CRUD endpoints  
├── courses/route.ts        # Course CRUD endpoints
└── attendance/route.ts     # Attendance marking endpoints
```

## 🚀 How to Use

### Testing API Endpoints

You can test these endpoints right now:
- `http://localhost:3000/api/students` (GET)
- `http://localhost:3000/api/departments` (GET)
- `http://localhost:3000/api/courses` (GET)
- `http://localhost:3000/api/attendance` (GET)

### Adding Backend Logic

When you're ready to implement backend:

1. **Set up Database** (Prisma recommended)
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Define Schema** (`prisma/schema.prisma`)
   ```prisma
   model Student {
     id          Int      @id @default(autoincrement())
     name        String
     studentId   String   @unique
     email       String
     // ... other fields
   }
   ```

3. **Update API Routes**
   Replace TODO comments in route files with actual database calls:
   ```typescript
   import { prisma } from '@/lib/prisma'
   
   export async function GET() {
     const students = await prisma.student.findMany()
     return NextResponse.json(students)
   }
   ```

4. **Update Services**
   Modify `/services/index.ts` to call these API endpoints instead of mock data

## 📚 Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript with Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/use-custom-model-and-field-names)

## 🎯 Next Steps

1. Choose database (MySQL/PostgreSQL recommended)
2. Set up Prisma
3. Create database schema
4. Implement API routes
5. Update frontend services to use API
6. Add authentication

All templates are ready - just replace the TODO comments!
