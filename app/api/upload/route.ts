import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Connect to Supabase using the service key (which the anon key currently acts as)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const bucketName = "mentor-resources";
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`chat-attachments/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return new Response(`Upload error: ${error.message}`, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`chat-attachments/${fileName}`);

    return new Response(JSON.stringify({
      url: publicUrl,
      fileName: file.name,
      type: file.type,
      size: file.size,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Upload handler error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
