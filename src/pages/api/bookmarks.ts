import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const bookmarks = data.bookmarks;

    if (!bookmarks || !Array.isArray(bookmarks)) {
      return new Response(JSON.stringify({ error: 'Invalid payload or missing bookmarks.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
       return new Response(JSON.stringify({ 
         error: 'Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.' 
       }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const authHeader = request.headers.get('Authorization');
    
    // Pass the auth header to Supabase client so it acts as the authenticated user
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader || ''
        }
      }
    });
    
    // We assume there's a table called 'bookmarks'
    const { data: insertedData, error } = await supabase
      .from('bookmarks')
      .insert(bookmarks.map(b => ({
        title: b.title,
        url: b.url,
        add_date: b.addDate ? new Date(parseInt(b.addDate) * 1000).toISOString() : new Date().toISOString(),
      })));

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Uploaded ${bookmarks.length} bookmarks to Supabase successfully!`,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
