import os
from dotenv import load_dotenv
from anthropic import Anthropic  # Assuming you are using the Anthropic client

# Load environment variables from the .env file
load_dotenv()  # Explicitly load the .env file

# Retrieve the API key from environment variables
API_KEY = os.getenv('ANTHROPIC_API_KEY')
MODEL_NAME = "claude-3-haiku-20240307"

# Check if API key is loaded properly
if not API_KEY:
    raise ValueError("API_KEY is not set! Please check your .env file.")
else:
    print(f"API_KEY is: {API_KEY}")

# Initialize the Anthropic client with the API key
client = Anthropic(api_key=API_KEY)

# Function to get completion from the Claude model
def get_completion(prompt: str):
    try:
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=2000,
            temperature=0.0,
            messages=[
              {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text
    except Exception as e:
        print(f"Error occurred: {e}")

# Test the setup
prompt = "Hello, Claude!"
response = get_completion(prompt)

if response:
    print(f"Claude's Response: {response}")
