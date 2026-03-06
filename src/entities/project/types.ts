export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  uploadToken: string;
  collaborations: Array<{
    id: string;
    creator: {
      id: string;
      fullName: string;
      email: string;
      profilePhotoUrl: string | null;
    };
    submissions: Array<{
      id: string;
      assets: Array<{ id: string; filename: string }>;
    }>;
  }>;
};
