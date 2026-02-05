import { createClient } from "./lib/supabase/server";

async function test() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('returns').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
