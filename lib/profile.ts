import { createClient } from "./supabase/server";


//retrieve user profile by user ID
export async function getUserProfile(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        throw new Error(`Error fetching user profile: ${error.message}`);
    }

    return data;
}

//update the bio field of the user profile
export async function updateUserBio(userId: string, bio: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .update({ bio_text: bio })
        .eq("id", userId)
        .select();

    if (error) {
        throw new Error(`Error updating user bio: ${error.message}`);
    }
    return data
}

export async function updateUserProfile(
    userId: string,
    payload: {
        bio_text: string;
        name_first: string;
        name_last: string | null;
        name_middle: string | null;
        avatar_url?: string | null;
    }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId)
        .select()
        .maybeSingle();

    if (error) {
        throw new Error(`Error updating user profile: ${error.message}`);
    }

    if (data) {
        return data;
    }

    const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, ...payload })
        .select()
        .single();

    if (insertError) {
        throw new Error(`Error creating user profile: ${insertError.message}`);
    }

    return inserted;
}

//upload the profile image to the storage and update the profile image URL in the user profile
export async function updateUserProfileImage(userId: string, file: File) {
    const supabase = await createClient();
    const filePath = `/${userId}_${file.name}`;


}
