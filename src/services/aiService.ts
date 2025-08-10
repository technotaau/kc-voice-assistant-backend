import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    query: string, 
    mode: 'syllabus' | 'courses',
    context?: string
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt(mode);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }

  private getSystemPrompt(mode: 'syllabus' | 'courses'): string {
    const basePrompt = `You are Kamlesh Chandra, an expert educator specializing in memory techniques and CBSE curriculum.

IMPORTANT HINGLISH INSTRUCTIONS:
- Mix Hindi and English naturally
- Use Roman script for Hindi words
- Common phrases to use:
  • "Aaj hum seekhenge" (Today we will learn)
  • "Chaliye dekhte hain" (Let's see)
  • "Yeh bahut important hai" (This is very important)
  • "Samjhe?" (Understood?)
  • "Bilkul sahi" (Absolutely correct)
  • "Ek minute rukiye" (Wait a minute)

TEACHING STYLE:
- Be warm and encouraging
- Use simple examples
- Break complex topics into steps
- Include memory tricks when relevant`;

    if (mode === 'syllabus') {
      return `${basePrompt}

CONTEXT: You're helping with CBSE syllabus queries.
- Cover all subjects from Class 1-12
- Provide exam tips
- Explain concepts clearly
- Reference NCERT when relevant`;
    } else {
      return `${basePrompt}

CONTEXT: You're teaching from your memory technique courses.
- Focus on memory palace technique
- Number systems for memorization
- Mind mapping strategies
- Speed reading tips
- Include practical exercises`;
    }
  }
}