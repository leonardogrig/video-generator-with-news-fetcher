import os
import json
from elevenlabs import generate, save
from dotenv import load_dotenv
import datetime

load_dotenv()

elevenLabsApi = os.getenv("ELEVENLABSAPI")

with open('./generated_script.json', 'r') as f:
    data = json.load(f)

output_dir = './audio'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Get the current date
current_date = datetime.datetime.now()

# Convert the month number to month name
month_names = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']
month_name = month_names[current_date.month - 1]

# Get the day as an ordinal number
day = current_date.day
ordinal_suffix = 'th' if 11 <= day <= 13 else {
    1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
day_with_suffix = f"{day}{ordinal_suffix}"

introAndOutroObject = {
    "intro": f"These are the top headlines about Artificial Intelligence for {month_name} {day_with_suffix}.",
    "outro": "That's a wrap for today. Subscribe to lion's AI channel to stay in tune!"
}

def sanitize_filename(filename):
    invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
    for char in invalid_chars:
        filename = filename.replace(char, '')
    return filename

# Generate and save the intro
# intro_audio = generate(introAndOutroObject['intro'], api_key=elevenLabsApi,
#                        voice=os.getenv("VOICE_ID"))
# save(intro_audio, os.path.join(output_dir, "intro.wav"))

# Generate and save each news item
for i, item in enumerate(data):
    title = sanitize_filename(item['title']).replace(":", ".")
    source = sanitize_filename(item['source']).replace("â€™", "'")
    text = f"{title}. {source}"
    audio = generate(text, api_key=elevenLabsApi, voice=os.getenv("VOICE_ID"))
    output_path = os.path.join(output_dir, f"audio{i+1}.wav")
    save(audio, output_path)

# # Generate and save the outro
# outro_audio = generate(introAndOutroObject['outro'], api_key=elevenLabsApi,
#                        voice=os.getenv("VOICE_ID"))
# save(outro_audio, os.path.join(output_dir, "outro.wav"))

print("Finished processing.")
