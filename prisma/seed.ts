import { PrismaClient, Role, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.postView.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing data cleaned.");

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@analyticsliv.com",
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "employee@analyticsliv.com",
      password: hashedPassword,
      role: Role.EMPLOYEE,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
  });

  console.log("Admin and Employee accounts created.");

  const categoryAnalytics = await prisma.category.create({
    data: {
      name: "Data & Analytics",
      slug: "data-analytics",
    },
  });

  const categoryCareers = await prisma.category.create({
    data: {
      name: "Careers & Tech",
      slug: "careers-tech",
    },
  });

  const categoryProductivity = await prisma.category.create({
    data: {
      name: "Productivity",
      slug: "productivity",
    },
  });

  console.log("Categories created.");

  const tagList = [
    { name: "analytics", slug: "analytics" },
    { name: "business intelligence", slug: "business-intelligence" },
    { name: "data trends", slug: "data-trends" },
    { name: "full-stack development", slug: "full-stack-development" },
    { name: "hiring", slug: "hiring" },
    { name: "software careers", slug: "software-careers" },
    { name: "developer habits", slug: "developer-habits" },
    { name: "productivity", slug: "productivity" },
    { name: "coding tips", slug: "coding-tips" },
  ];

  const createdTags: Record<string, string> = {};
  for (const tag of tagList) {
    const created = await prisma.tag.create({
      data: tag,
    });
    createdTags[tag.name] = created.id;
  }

  console.log("Tags created.");

  const blog1 = await prisma.post.create({
    data: {
      title: "The Future of Data Analytics: What Every Business Should Know in 2026",
      slug: "the-future-of-data-analytics-what-every-business-should-know-in-2026",
      excerpt: "The shift from reactive reporting to real-time, predictive analytics has changed how businesses make decisions.",
      content: `<h2>Data used to be something companies collected. Today, it's something companies think with.</h2>
<p>The shift from reactive reporting to real-time, predictive analytics has changed how businesses make decisions. A decade ago, most companies looked at last month's numbers to plan next quarter. Now, dashboards update by the second, and AI models forecast outcomes before a trend even fully forms.</p>

<h3>1. From Descriptive to Predictive</h3>
<p>Traditional analytics answered "what happened?" Modern analytics answers "what's likely to happen next?" — and increasingly, "what should we do about it?" Predictive models are now embedded directly into everyday tools, not just specialist software.</p>

<h3>2. Democratization of Data</h3>
<p>You no longer need a data science degree to explore data. No-code dashboards and natural-language query tools mean a marketing manager can ask "which campaign drove the most signups last week?" and get an instant, visual answer.</p>

<h3>3. The Rise of Real-Time Decisioning</h3>
<p>Batch reports run overnight are being replaced by streaming analytics — useful for fraud detection, inventory management, and customer experience personalization, where a delay of even a few hours can mean lost revenue.</p>

<h3>4. Privacy-First Analytics</h3>
<p>With tightening data regulations globally, businesses are investing in privacy-preserving analytics — aggregated insights without exposing individual user data. This isn't just compliance; it's becoming a trust differentiator.</p>

<p><strong>Takeaway:</strong> Companies that treat analytics as a core decision-making layer — not just a reporting function — are the ones that will move faster and smarter in the years ahead.</p>`,
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
      status: PostStatus.PUBLISHED,
      readingTime: "4 min read",
      viewCount: 142,
      authorId: employee.id,
      categoryId: categoryAnalytics.id,
      publishedAt: new Date(),
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: blog1.id, tagId: createdTags["analytics"] },
      { postId: blog1.id, tagId: createdTags["business intelligence"] },
      { postId: blog1.id, tagId: createdTags["data trends"] },
    ],
  });

  const blog2 = await prisma.post.create({
    data: {
      title: "Why Full-Stack Developers Are More Valuable Than Ever",
      slug: "why-full-stack-developers-are-more-valuable-than-ever",
      excerpt: "A good full-stack developer isn't someone who knows a little of everything — it's someone who knows enough of everything to build something that actually works, end to end.",
      content: `<h2>A good full-stack developer isn't someone who knows a little of everything — it's someone who knows enough of everything to build something that actually works, end to end.</h2>

<h3>1. Startups Need Builders, Not Specialists (At First)</h3>
<p>Early-stage companies rarely have the luxury of ten specialized engineers. They need people who can design a database schema in the morning and fix a CSS bug in the afternoon. Full-stack developers fill that gap.</p>

<h3>2. The Modern Stack Has Gotten More Unified</h3>
<p>With frameworks like Next.js blurring the line between frontend and backend, and tools like Prisma simplifying database work, it's genuinely easier than it used to be for one person to own a feature from UI to API to database.</p>

<h3>3. Faster Iteration, Fewer Handoffs</h3>
<p>When one person understands the whole flow of a feature, there's less back-and-forth between teams. Bugs get fixed faster because there's no "that's not my part of the stack" excuse.</p>

<h3>4. What Companies Actually Look For</h3>
<p>Beyond just knowing React and Node, companies increasingly value full-stack developers who understand:</p>
<ul>
  <li>Basic system design and API structuring</li>
  <li>Authentication and security fundamentals</li>
  <li>Deployment and debugging in production</li>
  <li>Writing clean, readable, and testable code</li>
</ul>

<p><strong>Takeaway:</strong> Full-stack development isn't about being a jack-of-all-trades and master of none — it's about being able to take an idea from concept to a working, deployed product. That skill only becomes more valuable as teams stay lean and timelines get tighter.</p>`,
      coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
      status: PostStatus.PUBLISHED,
      readingTime: "5 min read",
      viewCount: 238,
      authorId: employee.id,
      categoryId: categoryCareers.id,
      publishedAt: new Date(),
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: blog2.id, tagId: createdTags["full-stack development"] },
      { postId: blog2.id, tagId: createdTags["hiring"] },
      { postId: blog2.id, tagId: createdTags["software careers"] },
    ],
  });

  const blog3 = await prisma.post.create({
    data: {
      title: "5 Small Habits That Make You a Better Developer",
      slug: "5-small-habits-that-make-you-a-better-developer",
      excerpt: "None of these habits require extra time in your day — they just require a small shift in how you already work.",
      content: `<h3>1. Read code more than you write it</h3>
<p>Reviewing others' code — even messy code — teaches you patterns and anti-patterns faster than tutorials do.</p>

<h3>2. Write commit messages like someone else will read them</h3>
<p>Because they will — including future you.</p>

<h3>3. Google the error message, not the whole problem</h3>
<p>Specific errors lead to specific answers.</p>

<h3>4. Refactor in small steps</h3>
<p>Big rewrites break things; small, tested changes don't.</p>

<h3>5. Take breaks before you're stuck for an hour</h3>
<p>A 10-minute walk often solves what an hour of staring at the screen won't.</p>

<p>None of these habits require extra time in your day — they just require a small shift in how you already work.</p>`,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
      status: PostStatus.PUBLISHED,
      readingTime: "3 min read",
      viewCount: 95,
      authorId: employee.id,
      categoryId: categoryProductivity.id,
      publishedAt: new Date(),
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: blog3.id, tagId: createdTags["developer habits"] },
      { postId: blog3.id, tagId: createdTags["productivity"] },
      { postId: blog3.id, tagId: createdTags["coding tips"] },
    ],
  });

  console.log("All 3 assignment sample blogs seeded successfully with exact content!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
