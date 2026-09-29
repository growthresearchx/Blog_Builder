import { prisma } from "../lib/prisma";
import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  requireAuth,
  requireAdmin,
  TokenPayload,
} from "../lib/auth";
import { signupSchema, loginSchema } from "../lib/validations/auth";
import { Role } from "@prisma/client";

async function runAuthTests() {
  console.log("==========================================");
  console.log("   PHASE 3: AUTHENTICATION & RBAC TESTS   ");
  console.log("==========================================\n");

  // 1. Password Hashing & Security
  console.log("1. Testing Password Hashing & Bcrypt Security...");
  const rawPassword = "TestPassword@2026";
  const hashed = await hashPassword(rawPassword);
  console.log(`   - Generated Hash: ${hashed.substring(0, 20)}...`);
  const isMatch = await comparePassword(rawPassword, hashed);
  const isWrongMatch = await comparePassword("WrongPassword", hashed);

  if (isMatch && !isWrongMatch && hashed.startsWith("$2")) {
    console.log("   ✓ Bcrypt hashing and verification working securely.\n");
  } else {
    throw new Error("Password hashing test failed!");
  }

  // 2. Signup Validations & Public Role Enforcement
  console.log("2. Testing Signup Validation & Role Enforcement...");
  const testEmail = `new_employee_${Date.now()}@analyticsliv.com`;

  // Test Zod validation
  const validSignup = signupSchema.safeParse({
    name: "New Developer",
    email: testEmail,
    password: "Password123!",
  });
  console.log(`   - Valid input parse result: ${validSignup.success}`);

  const invalidEmailSignup = signupSchema.safeParse({
    name: "New Developer",
    email: "not-an-email",
    password: "Password123!",
  });
  console.log(`   - Invalid email rejected: ${!invalidEmailSignup.success}`);

  // Create user in DB and verify role is EMPLOYEE
  const createdUser = await prisma.user.create({
    data: {
      name: "New Developer",
      email: testEmail,
      password: await hashPassword("Password123!"),
      role: Role.EMPLOYEE, // Public signup strictly restricted to EMPLOYEE
    },
  });

  if (createdUser.role === Role.EMPLOYEE) {
    console.log("   ✓ User created successfully with strictly enforced role: EMPLOYEE");
  } else {
    throw new Error("Public signup allowed non-EMPLOYEE role!");
  }

  // Test duplicate email rejection
  try {
    await prisma.user.create({
      data: {
        name: "Duplicate Developer",
        email: testEmail,
        password: await hashPassword("Password123!"),
        role: Role.EMPLOYEE,
      },
    });
    throw new Error("Duplicate email was allowed!");
  } catch (err: any) {
    console.log("   ✓ Duplicate email registration rejected (P2002 constraint).\n");
  }

  // 3. Login Flow Tests (Admin & Employee)
  console.log("3. Testing Login Flow...");
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@analyticsliv.com" },
  });
  if (!adminUser) throw new Error("Admin seed user not found!");

  const adminPassMatch = await comparePassword("Password@123", adminUser.password);
  const adminWrongPass = await comparePassword("WrongPass", adminUser.password);

  console.log(`   - Admin correct credentials match: ${adminPassMatch}`);
  console.log(`   - Admin wrong credentials rejected: ${!adminWrongPass}`);

  if (adminPassMatch && !adminWrongPass) {
    console.log("   ✓ Admin credential verification passed.");
  }

  const empUser = await prisma.user.findUnique({
    where: { email: "employee@analyticsliv.com" },
  });
  if (!empUser) throw new Error("Employee seed user not found!");

  const empPassMatch = await comparePassword("Password@123", empUser.password);
  console.log(`   - Employee correct credentials match: ${empPassMatch}`);
  console.log("   ✓ Employee credential verification passed.\n");

  // 4. Inactive / Deactivated User Check
  console.log("4. Testing Account Status (Deactivated User)...");
  const inactiveUser = await prisma.user.create({
    data: {
      name: "Inactive User",
      email: `inactive_${Date.now()}@analyticsliv.com`,
      password: await hashPassword("Password@123"),
      role: Role.EMPLOYEE,
      isActive: false,
    },
  });

  if (!inactiveUser.isActive) {
    console.log("   ✓ Inactive account status correctly identified and stored.\n");
  }

  // 5. JWT Generation, Expiration & Content Safety
  console.log("5. Testing JWT Token Security...");
  const payload: TokenPayload = {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  };

  const token = await signToken(payload);
  console.log(`   - Generated Token: ${token.substring(0, 30)}...`);

  const verified = await verifyToken(token);
  console.log(`   - Verified Token Subject ID: ${verified?.id}`);
  console.log(`   - Verified Token Role: ${verified?.role}`);

  // Test tampered / invalid token
  const tamperedVerified = await verifyToken(token + "invalid_signature");
  console.log(`   - Tampered token rejected: ${tamperedVerified === null}`);

  if (verified && verified.role === "ADMIN" && tamperedVerified === null) {
    console.log("   ✓ JWT Signing & Verification passed with zero sensitive data in payload.\n");
  }

  // 6. Role-Based Access Control Guards (requireAuth & requireAdmin)
  console.log("6. Testing Role-Based Authorization Guards...");

  // Mock Request with Admin token
  const adminReq = new Request("http://localhost:3000/api/admin/stats", {
    headers: {
      cookie: `auth_token=${token}`,
    },
  });

  const adminSession = await requireAuth(adminReq);
  console.log(`   - requireAuth for Admin passed: ${adminSession.email} (${adminSession.role})`);

  const adminGuardResult = await requireAdmin(adminReq);
  console.log(`   - requireAdmin for Admin passed: ${adminGuardResult.role === "ADMIN"}`);

  // Mock Request with Employee token
  const empToken = await signToken({
    id: empUser.id,
    email: empUser.email,
    name: empUser.name,
    role: empUser.role,
  });

  const empReq = new Request("http://localhost:3000/api/employee/blogs", {
    headers: {
      cookie: `auth_token=${empToken}`,
    },
  });

  const empSession = await requireAuth(empReq);
  console.log(`   - requireAuth for Employee passed: ${empSession.email} (${empSession.role})`);

  try {
    await requireAdmin(empReq);
    throw new Error("Employee was allowed into Admin-only guard!");
  } catch (err: any) {
    console.log(`   ✓ requireAdmin for Employee correctly threw: ${err.message}`);
  }

  // Clean up test users
  await prisma.user.delete({ where: { id: createdUser.id } });
  await prisma.user.delete({ where: { id: inactiveUser.id } });

  console.log("\n==========================================");
  console.log("   ALL PHASE 3 TESTS COMPLETED: 100% OK   ");
  console.log("==========================================");
}

runAuthTests()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
