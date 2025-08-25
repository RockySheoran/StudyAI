export interface ISummary {
  _id:string;
  fileId: string;
  content: string;
  generatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  userId?: string;
  createdAt: Date;
  

}
