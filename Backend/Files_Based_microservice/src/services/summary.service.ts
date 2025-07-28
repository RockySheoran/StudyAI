import Summary from '../models/summary.model';
import FileService from './file.service';
import LLMService from './llm.service';
import fs from 'fs';
import { ISummary } from '../models/summary.model';

class SummaryService {
  async createSummary(fileId: string): Promise<ISummary> {
    const file = await FileService.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Read file content
    const fileContent = fs.readFileSync(file.path);

    // Extract text from PDF
    const text = await LLMService.extractTextFromPDF(fileContent);

    // Generate summary
    const summary = await LLMService.generateSummary(text);

    // Save summary to database
    const newSummary = new Summary({
      file: file._id,
      content: text,
      summary
    });

    return await newSummary.save();
  }

  async getSummaryById(id: string): Promise<ISummary | null> {
    return await Summary.findById(id).populate('file');
  }

  async getSummaries(): Promise<ISummary[]> {
    return await Summary.find().populate('file').sort({ createdAt: -1 });
  }

  async deleteSummary(id: string): Promise<void> {
    await Summary.findByIdAndDelete(id);
  }
}

export default new SummaryService();