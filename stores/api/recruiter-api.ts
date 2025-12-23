import { axiosInstance } from "./api-client";
import { ENDPOINTS } from "./api-endpoints";

export async function getRecruiterProfile() {
  const res = await axiosInstance.get(ENDPOINTS.RECRUITER_PROFILE);
  return (res.data as any).data.profile; // Returns the profile object
}
