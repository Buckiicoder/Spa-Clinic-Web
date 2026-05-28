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
      if (value !== undefined && value !== null && value !== "") {
        merged[key as keyof BookingDraft] = value as never;
      }
    });

    bookingMemory.set(conversationId, merged);

    return merged;
  }

  static clear(conversationId: string) {
    bookingMemory.delete(conversationId);
  }
}
