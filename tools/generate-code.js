import { GoogleGenAI } from "@google/genai";
import fs from "fs-extra";
import path from "path";
export async function generateCode(params) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Build the prompt for Gemini
  const prompt = `Generate a complete, production-ready project based on the following requirements:

Description: ${params.description}
Language: ${params.language}
${params.framework ? `Framework: ${params.framework}` : ''}
${params.includeTests ? 'Include unit tests' : 'No tests needed'}

Please provide:
1. Complete file structure (directory tree)
2. All necessary files with complete code
3. Package configuration files (package.json, requirements.txt, etc.)
4. README.md with:
   - Project description
   - Installation instructions
   - Setup commands
   - How to run the project
   - How to run tests (if applicable)
   - Environment variables needed
5. Any additional configuration files needed

IMPORTANT: The fileStructure should represent the direct contents of the project directory, NOT wrapped in a root node.

Format your response as JSON with the following structure:
{
  "projectName": "project-name",
  "fileStructure": [
    {
      "type": "file",
      "name": "README.md"
    },
    {
      "type": "directory",
      "name": "src",
      "children": [
        {
          "type": "file",
          "name": "index.js"
        }
      ]
    }
  ],
  "files": [
    {
      "path": "relative/path/to/file",
      "content": "file content here",
      "description": "brief description of this file"
    }
  ],
  "setupInstructions": {
    "prerequisites": ["prerequisite 1", "prerequisite 2"],
    "installCommands": ["command 1", "command 2"],
    "runCommands": ["command to run the project"],
    "testCommands": ["command to run tests"],
    "environmentVariables": [
      {
        "name": "VAR_NAME",
        "description": "what this variable is for",
        "example": "example value"
      }
    ]
  },
  "additionalNotes": "any additional information or tips"
}`;

  try {
    // Call Gemini API using SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert software developer who creates complete, production-ready projects with clear documentation and setup instructions.",
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const generatedText = response.text;
    
    
    // Try to parse the JSON from the response
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7); // Remove ```json
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3); // Remove ```
    }
    
    // Remove trailing code block markers
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    
    cleanedText = cleanedText.trim();
    
    // Try to find JSON object if text contains other content
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const jsonString = jsonMatch[0];
    const projectData = JSON.parse(jsonString);
    const data =  {
      success: true,
      projectName: projectData.projectName,
      fileStructure: projectData.fileStructure,
      files: projectData.files,
      setupInstructions: projectData.setupInstructions,
      additionalNotes: projectData.additionalNotes,
      summary: {
        totalFiles: projectData.files.length,
        language: params.language,
        framework: params.framework,
        hasTests: params.includeTests
      }
    };
    await generateProject(data , params.rootpath)
    
    // Return data that can be used by writeFilesToDisk function
    return data
    
  } catch (error) {
    console.error("Code generation error:", error);
    throw error;
  }
}




/**
 * Creates directories recursively based on fileStructure tree
 */
async function createStructure(basePath, node) {
  if (node.type === "directory") {
    const dirPath = path.join(basePath, node.name);
    await fs.ensureDir(dirPath);

    if (node.children) {
      for (const child of node.children) {
        await createStructure(dirPath, child);
      }
    }
  }

  if (node.type === "file") {
    const filePath = path.join(basePath, node.name);
    await fs.ensureFile(filePath);
  }
}

/**
 * Writes actual file contents
 */
async function writeFiles(projectPath, files) {
  for (const file of files) {
    const fullPath = path.join(projectPath, file.path);
    await fs.outputFile(fullPath, file.content || "");
  }
}

/**
 * MAIN FUNCTION — JSON is passed directly
 */
async function generateProject(data , root) {
    
const CODEGEN_ROOT = root;
  // The project root inside your defined root directory
  const projectPath = path.join(CODEGEN_ROOT, data.projectName);

  console.log("Generating project at:", projectPath);
  await fs.ensureDir(projectPath);

  // Create folder structure
  await createStructure(projectPath, data.fileStructure);

  // Write content into files
  await writeFiles(projectPath, data.files);

  console.log(" Project generated successfully!");
}
