import { sendTripRegistrationConfirmation } from "@/lib/email";

type TriggerTripRegistrationEmailInput = {
  recipientEmail: string;
  tripId: string;
  tripTitle: string;
  claimUrl?: string | null;
  detailPath?: "trips" | "day-events";
};

export async function triggerTripRegistrationEmail({
  recipientEmail,
  tripId,
  tripTitle,
  claimUrl,
  detailPath,
}: TriggerTripRegistrationEmailInput): Promise<{ error: string | null }> {
  return sendTripRegistrationConfirmation({
    to: recipientEmail,
    tripTitle,
    tripId,
    claimUrl,
    detailPath,
  });
}
