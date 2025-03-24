export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const fileUrl = url.searchParams.get("url")

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "Missing url parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch the file from the original URL
    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Vercel Serverless Function",
      },
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch file: ${response.status}` }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the file content and content type
    const fileContent = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Create a new response with the file content and appropriate headers
    return new Response(fileContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileUrl.split("/").pop()}"`,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error in proxy download route:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to proxy download",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

