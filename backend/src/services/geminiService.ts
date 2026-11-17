import { getGenAI } from '../config/gemini';

export interface DocumentAnalysisResult {
  documentType: string;
  category: string;
  holderName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  summary: string;
  importantDetails: string[];
  extractedFields: Record<string, any>;
  confidence: number;
}

const ANALYSIS_PROMPT = `You are a document analysis AI. Analyze the provided document image/PDF and extract the following information in JSON format. Be as accurate as possible.

Return a valid JSON object with these fields:
{
  "documentType": "Type of document (e.g., Passport, Driver's License, Insurance, Certificate, Invoice, etc.)",
  "category": "One of: Identity, Educational, Vehicle, Insurance, Financial, Property, Medical, Legal, Other",
  "holderName": "Full name of the document holder/owner if visible",
  "documentNumber": "Any document/ID/reference number if present",
  "issuingAuthority": "Organization that issued the document if visible",
  "issueDate": "Issue date in YYYY-MM-DD format if visible",
  "expiryDate": "Expiry date in YYYY-MM-DD format if visible",
  "summary": "Brief summary of the document (2-3 sentences)",
  "importantDetails": ["Array of strings highlighting key points, notable details, or important information found in the document"],
  "extractedFields": "Object with any other important key-value pairs found in the document (e.g., address, date of birth, policy number, etc.)",
  "confidence": "Confidence score between 0 and 1"
}

Important:
- Only include fields where information is clearly visible/readable
- Use null for fields where information is not found
- Dates must be in YYYY-MM-DD format
- importantDetails should be an array of concise strings, each highlighting one key point
- extractedFields should capture all other relevant key-value data not covered by the named fields above
- Return ONLY valid JSON, no markdown or extra text`;

/**
 * Analyze a document using Gemini AI
 */
export const analyzeDocument = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imagePart = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await model.generateContent([ANALYSIS_PROMPT, imagePart]);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response - handle markdown code blocks
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    return {
      documentType: parsed.documentType || 'unknown',
      category: parsed.category || 'Other',
      holderName: parsed.holderName || undefined,
      documentNumber: parsed.documentNumber || undefined,
      issuingAuthority: parsed.issuingAuthority || undefined,
      issueDate: parsed.issueDate || undefined,
      expiryDate: parsed.expiryDate || undefined,
      summary: parsed.summary || '',
      importantDetails: Array.isArray(parsed.importantDetails) ? parsed.importantDetails : [],
      extractedFields: parsed.extractedFields || {},
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to parse AI analysis response');
  }
};
