import { serve } from "https://deno.land/std/http/server.ts";

const characterCounts = new Map<string, number>();

const handler = async (req: Request): Promise<Response> => {
    const { pathname, searchParams } = new URL(req.url);

    const route = '/' + pathname.split('/')[1];
    switch (route) {
        case '/emit':
            const keysMsg = searchParams.get("keys");
            if (!keysMsg) {
                return new Response("no keys provided", { status: 400 });
            }
        
            for (const [_, char, num] of keysMsg.matchAll(/([a-z])([0-9]+)/g)) {
                const n = characterCounts.get(char) || 0;
                characterCounts.set(char, n + Number(num));
            }
        case '/keys':
            return new Response(JSON.stringify([...characterCounts]), {
                headers: {
                    "content-type": "application/json",
                }
            });
    }

    // file serving for all other URLs
    try {
        if (route === '/' || route === '/index.html') {
            const filePathUrl = new URL('./static/index.html', import.meta.url).toString();
            const resp = await fetch(filePathUrl.toString());
            return new Response(resp.body, {
                headers: { "content-type": "text/html; charset=utf-8" },
            });
        }

        const filePathUrl = new URL(`./static${route}`, import.meta.url).toString();
        const resp = await fetch(filePathUrl.toString());
        return new Response(resp.body, {
            headers: { 'content-type': getFileType(route) }
        });
    } catch(e) {
        return new Response("not found", { status: 404 });
    }
}

function getFileType(name: string) {
    if (name.endsWith('.js')) return 'application/javascript';
    if (name.endsWith('.css')) return 'text/css';
    return 'text/plain';
}

console.log('http://localhost:8000')
await serve(handler);