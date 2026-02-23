import { sendTripRegistrationConfirmation } from "@/lib/email";

type TriggerTripRegistrationEmailInput = {
  recipientEmail: string;
  tripId: string;
  tripTitle: string;
};

export async function triggerTripRegistrationEmail({
  recipientEmail,
  tripId,
  tripTitle,
}: TriggerTripRegistrationEmailInput): Promise<{ error: string | null }> {
  return sendTripRegistrationConfirmation({
    to: recipientEmail,
    tripTitle,
    tripId,
  });
}
