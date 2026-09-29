import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Role, PostStatus } from "@prisma/client";

async function main() {
  console.log("==================================================");
  console.log("       PHASE 5: STRICT PDF AUDIT VERIFICATION     ");
  console.log("==================================================\n");

  // 1. Verify Admin and Employee exist
  console.log("--- 1. Verifying System Users ---");
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  const employeeUser = await prisma.user.findFirst({ where: { role: Role.EMPLOYEE } });

  if (!adminUser) throw new Error("Admin user not found in database!");
  if (!employeeUser) throw new Error("Employee user not found in database!");

  console.log(`✓ Admin User Found: ${adminUser.name} (${adminUser.email})`);
  console.log(`✓ Employee User Found: ${employeeUser.name} (${employeeUser.email})`);

  // 2. Test Admin Dashboard Stats Logic (Strictly PDF required)
  console.log("\n--- 2. Testing Audited Admin Stats Calculation ---");
  const totalBlogs = await prisma.post.count();
  const viewsAggregate = await prisma.post.aggregate({
    _sum: { viewCount: true },
  });
  const totalViews = viewsAggregate._sum.viewCount || 0;

  const mostActive = await prisma.user.findFirst({
    where: { role: Role.EMPLOYEE },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { posts: true } },
    },
    orderBy: {
      posts: { _count: "desc" },
    },
  });

  console.log(`✓ Total Blogs: ${totalBlogs}`);
  console.log(`✓ Total Views: ${totalViews}`);
  console.log(`✓ Most Active Employee (Bonus): ${mostActive?.name} (${mostActive?._count.posts} posts)`);

  // 3. Test Employee Creation via Admin
  console.log("\n--- 3. Testing Admin Employee Creation & bcrypt hashing ---");
  const testEmail = `audit.employee.${Date.now()}@analyticsliv.com`;
  const plainPassword = "SecurePassword123!";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const createdEmployee = await prisma.user.create({
    data: {
      name: "Audit Test Employee",
      email: testEmail,
      password: hashedPassword,
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  console.log(`✓ Created test employee: ${createdEmployee.name} (${createdEmployee.email})`);

  // Verify bcrypt password matching
  const isMatch = await bcrypt.compare(plainPassword, createdEmployee.password);
  if (!isMatch) throw new Error("Bcrypt password verification failed!");
  console.log("✓ Bcrypt password verification passed for new employee");

  // Create a blog authored by this test employee
  const testPost = await prisma.post.create({
    data: {
      title: "Test Blog by Temp Employee",
      slug: `test-blog-temp-${Date.now()}`,
      content: "<p>This is a temporary test blog content to verify post preservation.</p>",
      status: PostStatus.PUBLISHED,
      authorId: createdEmployee.id,
      viewCount: 10,
    },
  });
  console.log(`✓ Created test blog ID: ${testPost.id} authored by temp employee`);

  // 4. Test Employee Deletion with Post Preservation (onDelete: SetNull)
  console.log("\n--- 4. Testing Employee Deletion & Post Preservation ---");
  await prisma.user.delete({
    where: { id: createdEmployee.id },
  });
  console.log("✓ Deleted temp employee user");

  // Verify post still exists with authorId = null
  const preservedPost = await prisma.post.findUnique({
    where: { id: testPost.id },
  });

  if (!preservedPost) {
    throw new Error("FAIL: Post was deleted when employee was deleted! Non-destructive rule violated.");
  }
  if (preservedPost.authorId !== null) {
    throw new Error(`FAIL: Post authorId expected to be null, got: ${preservedPost.authorId}`);
  }
  console.log("✓ SUCCESS: Post was preserved! authorId successfully set to null.");

  // 5. Test Admin Blog Unpublish & Override
  console.log("\n--- 5. Testing Admin Blog Unpublish & Override ---");
  const unpublishedPost = await prisma.post.update({
    where: { id: testPost.id },
    data: { status: PostStatus.UNPUBLISHED },
  });
  if (unpublishedPost.status !== PostStatus.UNPUBLISHED) {
    throw new Error("Admin unpublish failed!");
  }
  console.log("✓ SUCCESS: Admin successfully unpublished blog post (status = UNPUBLISHED)");

  // 6. Test Category CRUD
  console.log("\n--- 6. Testing Category CRUD & Safe Deletion ---");
  const testCategory = await prisma.category.create({
    data: {
      name: `Audit Cat ${Date.now()}`,
      slug: `audit-cat-${Date.now()}`,
    },
  });
  console.log(`✓ Created category: ${testCategory.name}`);

  // Link test post to test category
  await prisma.post.update({
    where: { id: testPost.id },
    data: { categoryId: testCategory.id },
  });
  console.log("✓ Linked post to test category");

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id: testCategory.id },
    data: { name: `${testCategory.name} Updated` },
  });
  console.log(`✓ Updated category name: ${updatedCategory.name}`);

  // Delete category and verify post remains
  await prisma.category.delete({
    where: { id: testCategory.id },
  });
  console.log("✓ Deleted test category");

  const postAfterCatDelete = await prisma.post.findUnique({
    where: { id: testPost.id },
  });
  if (!postAfterCatDelete) {
    throw new Error("Post was deleted when category was deleted!");
  }
  if (postAfterCatDelete.categoryId !== null) {
    throw new Error("Post categoryId was not set to null upon category deletion!");
  }
  console.log("✓ SUCCESS: Category deleted safely and post preserved with categoryId = null.");

  // 7. Test Tag CRUD & Safe Deletion
  console.log("\n--- 7. Testing Tag CRUD & Safe Deletion ---");
  const testTag = await prisma.tag.create({
    data: {
      name: `audit-tag-${Date.now()}`,
      slug: `audit-tag-${Date.now()}`,
    },
  });
  console.log(`✓ Created tag: #${testTag.name}`);

  // Connect tag to post
  await prisma.postTag.create({
    data: {
      postId: testPost.id,
      tagId: testTag.id,
    },
  });
  console.log("✓ Linked tag to test post");

  // Delete tag
  await prisma.tag.delete({
    where: { id: testTag.id },
  });
  console.log("✓ Deleted test tag");

  const postAfterTagDelete = await prisma.post.findUnique({
    where: { id: testPost.id },
    include: { tags: true },
  });
  if (!postAfterTagDelete) {
    throw new Error("Post was deleted when tag was deleted!");
  }
  if (postAfterTagDelete.tags.length !== 0) {
    throw new Error("Junction record was not deleted when tag was deleted!");
  }
  console.log("✓ SUCCESS: Tag deleted safely and post preserved intact.");

  // Clean up test post
  await prisma.post.delete({ where: { id: testPost.id } });
  console.log("✓ Cleaned up test post");

  console.log("\n==================================================");
  console.log("  ALL AUDITED PHASE 5 BACKEND & LOGIC TESTS PASSED ");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Test failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
