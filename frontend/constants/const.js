export const URL = "http://localhost:8000";
export const currentUserId = parseInt(sessionStorage.getItem('user_id'), 10) || 0;
export const group_id = parseInt(sessionStorage.getItem('group_id'), 10) || 0;
export const token = sessionStorage.getItem('token');
const reCaptchaKey = "6LdnWi0rAAAAAPCIs5ur1Te8sVSnO0q3zAlTgDcG";
const reCaptchaSec = "6LdnWi0rAAAAAKab7ANC4jtoR9FBJZxV7L3be4_V";