export type BookingDraft = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  service_id?: number | null;
  service_name?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  quantity?: number | null;
  symptom?: string | null;
  last_topic?: string | null;
  skin_type?: string | null;
  concern?: string | null;
  customer_stage?: "NEW" | "CONSULTING" | "INTERESTED" | "BOOKING";
  consult_step?: number | null;
  booking_intent?: boolean | null;
  booking_stage?: "SERVICE" | "CUSTOMER_INFO" | "SCHEDULE" | "CONFIRM" | null;
  pending_confirmation?: {
    field: string;
    oldValue: string;
    newValue: string;
  } | null;
};

const bookingMemory = new Map<string, BookingDraft>();

export class ChatMemoryService {
  static get(conversationId: string): BookingDraft {
    return bookingMemory.get(conversationId) || {};
  }

  static update(
    conversationId: string,
    data: Partial<BookingDraft>,
  ): BookingDraft {
    const oldData = bookingMemory.get(conversationId) || {};

    const merged: BookingDraft = {
      ...oldData,
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        merged[key as keyof BookingDraft] = value as never;
      }
    });

    bookingMemory.set(conversationId, merged);

    return merged;
  }

  static replaceBookingSchedule(
    conversationId: string,
    data: {
      booking_date?: string | null;
      booking_time?: string | null;
    },
  ) {
    const memory = this.get(conversationId);

    if (data.booking_date !== undefined) {
      memory.booking_date = data.booking_date;
    }

    if (data.booking_time !== undefined) {
      memory.booking_time = data.booking_time;
    }

    bookingMemory.set(conversationId, memory);

    return memory;
  }
  static clear(conversationId: string) {
    bookingMemory.delete(conversationId);
  }
}
