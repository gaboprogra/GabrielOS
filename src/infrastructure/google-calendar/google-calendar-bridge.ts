import "server-only";

type CreateCalendarEventInput = {
  dailyPlanItemId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  notes: string | null;
};

type CreateCalendarEventResult =
  | {
      success: true;
      eventId: string;
    }
  | {
      success: false;
      error: string;
    };

type DeleteCalendarEventInput = {
  eventId: string;
};

type DeleteCalendarEventResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function createGoogleCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<CreateCalendarEventResult> {
  const url = process.env.GOOGLE_CALENDAR_BRIDGE_URL;

  const secret = process.env.GOOGLE_CALENDAR_BRIDGE_SECRET;

  if (!url || !secret) {
    return {
      success: false,
      error: "Google Calendar Bridge no está configurado.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        action: "create",
        secret,

        dailyPlanItemId: input.dailyPlanItemId,
        title: input.title,

        startsAt: input.startsAt.toISOString(),
        endsAt: input.endsAt.toISOString(),

        notes: input.notes,
      }),

      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Apps Script respondió ${response.status}.`,
      };
    }

    const data: unknown = await response.json();

    if (typeof data !== "object" || data === null) {
      return {
        success: false,
        error: "Apps Script devolvió una respuesta inválida.",
      };
    }

    const result = data as {
      success?: boolean;
      eventId?: string;
      error?: string;
    };

    if (result.success !== true || !result.eventId) {
      return {
        success: false,
        error: result.error ?? "Google Calendar no creó el evento.",
      };
    }

    return {
      success: true,
      eventId: result.eventId,
    };
  } catch (error: unknown) {
    console.error("Error llamando Google Calendar Bridge:", error);

    return {
      success: false,
      error: "No se pudo conectar con Google Calendar.",
    };
  }
}

export async function deleteGoogleCalendarEvent(
  input: DeleteCalendarEventInput,
): Promise<DeleteCalendarEventResult> {
  const url = process.env.GOOGLE_CALENDAR_BRIDGE_URL;
  const secret = process.env.GOOGLE_CALENDAR_BRIDGE_SECRET;

  if (!url || !secret) {
    return {
      success: false,
      error: "Google Calendar Bridge no está configurado.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "cancel",
        secret,
        eventId: input.eventId,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Apps Script respondió ${response.status}.`,
      };
    }

    const data: unknown = await response.json();

    if (typeof data !== "object" || data === null) {
      return {
        success: false,
        error: "Apps Script devolvió una respuesta inválida.",
      };
    }

    const result = data as {
      success?: boolean;
      error?: unknown;
    };

    if (result.success !== true) {
      return {
        success: false,
        error:
          typeof result.error === "string"
            ? result.error.slice(0, 500)
            : "Google Calendar no eliminó el evento.",
      };
    }

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Error eliminando evento de Google Calendar:", error);

    return {
      success: false,
      error: "No se pudo conectar con Google Calendar.",
    };
  }
}
