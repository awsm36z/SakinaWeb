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
        Capacity?: string | null;
    }
) {
    const supabase = await createClient();

    // Strip undefined keys so we don't accidentally overwrite columns
    // (e.g. Capacity should only be sent when the caller explicitly sets it)
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    const { error } = await supabase
        .from("profiles")
        .update(cleanPayload)
        .eq("id", userId);

    if (error) {
        throw new Error(`Error updating user profile: ${error.message}`);
    }
}

//upload the profile image to the storage and update the profile image URL in the user profile
export async function updateUserProfileImage(userId: string, file: File) {
    const supabase = await createClient();
    const filePath = `/${userId}_${file.name}`;


}
