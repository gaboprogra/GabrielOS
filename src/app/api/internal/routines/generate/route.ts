import { generateAllRoutineWindows } from "@/modules/routines/application/generate-routine-window";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const results = await generateAllRoutineWindows(new Date());
    return Response.json({ success: true, results });
  } catch (error: unknown) {
    console.error("Falló la generación automática de rutinas:", error);
    return Response.json(
      { success: false, error: "No se pudo generar la ventana de rutinas." },
      { status: 500 },
    );
  }
}
