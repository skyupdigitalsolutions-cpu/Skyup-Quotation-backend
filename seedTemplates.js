import Template from "./models/Template.js";

const seedTemplates = [
  {
    tkey: "basic", category: "CRM Packages", name: "CRM - Basic",
    deliv: "Access Limits:\n• 1 Super Admin\n• 1 Admin\n• 5 Users\n• 5,000 Leads\n• 1 Meta Account\n• 1 Google Account\n• 1 Website\n\nFeatures:\n• Lead Management\n• Contacts Management\n• Projects\n• Reports\n• Attendance\n• Daily Report\n• AI Remark Summary\n• Website Tracking\n• Call Recording\n• Meta Ads Integration\n\nRestrictions:\n• SMS Blast ×\n• WhatsApp Blast ×\n• Email Blast ×",
    price: 3499, unit: "monthly", note: "Monthly: 3,499 (incl. GST)"
  },
  {
    tkey: "pro", category: "CRM Packages", name: "CRM - Pro",
    deliv: "Access Limits:\n• 1 Super Admin\n• 3 Admins\n• 30 Users\n• 20,000 Leads\n• 3 Meta Accounts\n• 3 Google Accounts\n• 3 Websites\n• 6,000 AI Minutes/Month\n\nFeatures:\n• Lead Management\n• Contacts Management\n• Projects, Attendance\n• Reports, Daily Report\n• AI Remark Summary\n• Email Blast, WhatsApp Blast\n• SMS Blast\n• Campaign Management\n• Website Tracking\n• Call Recording\n• Call Transcription\n• Google Ads Integration\n• Meta Ads Integration\n• WhatsApp Automation",
    price: 7499, unit: "monthly", note: "Monthly: 7,499 (incl. GST)"
  },
  {
    tkey: "advance", category: "CRM Packages", name: "CRM - Advance Plan",
    deliv: "Access Limits:\n• 1 Super Admin\n• 5 Admins\n• 50 Users\n• 50,000 Leads\n• 5 Meta Accounts\n• 5 Google Accounts\n• 5 Websites\n• 15,000 AI Minutes/Month\n\nFeatures:\n• Lead Management\n• Contacts Management\n• Reports\n• Attendance\n• Daily Report\n• AI Remark Summary\n• Email Blast\n• WhatsApp Blast\n• SMS Blast\n• Campaign Management\n• Website Tracking\n• Call Recording\n• Call Transcription\n• AI Call Summary\n• Google Ads Integration\n• Meta Ads Integration\n• WhatsApp Automation",
    price: 15499, unit: "monthly", note: "Monthly: 15,499 (incl. GST)"
  },
  {
    tkey: "enterprise", category: "CRM Packages", name: "CRM - Enterprise Plan",
    deliv: "Fully customized as per your requirements", price: 0, unit: "onetime", note: "Custom Pricing"
  },
  {
    tkey: "mobile", category: "CRM Packages", name: "CRM - Mobile",
    deliv: "• Attendance\n• Calling\n• Notification\n• Meeting management", price: 0, unit: "onetime", note: "Applicable for all Plans"
  },
  {
    tkey: "setup", category: "CRM Packages", name: "SET-UP",
    deliv: "Set-up cost as per the plan you choose", price: 0, unit: "onetime", note: "Set-up cost depends on chosen plan"
  },
  {
    tkey: "ai_automation", category: "AI Automation", name: "AI Automation",
    deliv: "• AI-powered lead scoring and routing\n• Automated customer responses via chat and email\n• Workflow automation for follow-ups and meetings\n• Smart campaign triggers based on customer behavior\n• AI-based analytics and recommendation engine",
    price: 0, unit: "onetime", note: "Pricing as per your requirements"
  },
  {
    tkey: "ai_chatbot", category: "AI Automation", name: "WhatsApp Automation & AI Chatbot",
    deliv: "WhatsApp Business Integration:\n• WhatsApp Business API setup\n• Send & receive messages\n• Bulk messaging templates configuration\n• Production-ready integration",
    price: 0, unit: "onetime", note: "Pricing as per your requirements"
  },
  {
    tkey: "seo_org", category: "Digital Marketing", name: "SEO & Organic Visibility",
    deliv: "• Technical SEO + Core Web Vitals Fixes\n• On-Page Optimization\n• 4 SEO Blogs / Month\n• GBP Management\n• 6–10 Backlinks / Month\n• Monthly Keyword Ranking Report",
    price: 20000, unit: "monthly", note: ""
  },
  {
    tkey: "social_gbp", category: "Digital Marketing", name: "Social Media & GBP Management",
    deliv: "• 12 Designed Posts / Month\n• 4 Reel Scripts + Video Editing\n• Caption & Hashtag Strategy\n• Community Management\n• Monthly Analytics Report",
    price: 15000, unit: "monthly", note: ""
  },
  {
    tkey: "ads_management", category: "Digital Marketing", name: "Google Ads & Meta Ads Management",
    deliv: "• Google Search & Display Campaigns\n• Facebook & Instagram Ads\n• Funnel-Based Ad Strategy\n• A/B Testing & Optimization\n• 8 Ad Creatives / Month\n• Monthly Performance Report",
    price: 20000, unit: "monthly", note: ""
  },
  {
    tkey: "website_design", category: "Digital Marketing", name: "Website Design & Development",
    deliv: "• Custom Corporate Website Design\n• Responsive UI/UX Design\n• Mobile-friendly development\n• CMS or e-commerce integration\n• Final pricing shared after discussion",
    price: 35000, unit: "onetime", note: "(5 - 6 pages)"
  }
];

// Seed the built-in service packages once (only if the collection is empty).
export async function seedTemplatesIfEmpty() {
  const count = await Template.countDocuments();
  if (count > 0) return;
  await Template.insertMany(seedTemplates.map((t, i) => ({ ...t, sort: i })));
}