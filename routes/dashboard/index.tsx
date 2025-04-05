// ./routes/dashboard/index.tsx

export const handler = async (_req: Request) => {
    const html = await Deno.readTextFile("./static/dashboardTemplate.html");
    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
};

export default function DashboardPage() {
    return (
        <div>
            {/* TSX MAGIC */}
        </div>
    );
}
