import { getClientReminderTemplate, buildWhatsAppUrl } from "./lib/whatsapp-templates";

const jobData = {
  title: "Graduation Photo",
  startAt: "2026-05-23T09:00:00Z",
  endAt: "2026-05-23T12:00:00Z",
  location: "Studio",
};

const clientData = {
  name: "Budi",
  phone: "081234567890",
};

const message = getClientReminderTemplate(jobData, clientData, "Andi");
console.log("Message:");
console.log(message);
console.log("\nURL:");
console.log(buildWhatsAppUrl(clientData.phone, message));
