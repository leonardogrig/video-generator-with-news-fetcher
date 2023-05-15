import json
from dateutil.relativedelta import relativedelta
import datetime
import requests
import os
from dotenv import load_dotenv
load_dotenv()


def get_news(query, api_key):
    url = "https://newsapi.org/v2/everything"

    # Get the current date and time
    current_date = datetime.datetime.now()

    # Get the date and time 24 hours ago
    past_date = current_date - relativedelta(hours=30)

    # Format the dates as strings
    current_date_str = current_date.strftime('%Y-%m-%dT%H:%M:%S')
    past_date_str = past_date.strftime('%Y-%m-%dT%H:%M:%S')

    parameters = {
        'q': query,
        'from': past_date_str,
        'to': current_date_str,
        'sortBy': 'popularity',
        'language': 'en',
        # 'domains': 'techcrunch.com,wired.com,arstechnica.com,theverge.com,engadget.com,gizmodo.com,mashable.com,cnet.com,zdnet.com,techradar.com,bloomberg.com,businessinsider.com,forbes.com,marketwatch.com,cnbc.com,fortune.com,economist.com,wsj.com,ft.com,reuters.com'+'futurism.com,venturebeat.com,biztoc.com,siliconangle.com,theguardian.com',
        'apiKey': api_key
    }

    response = requests.get(url, params=parameters)

    # Convert the response to JSON
    data = response.json()

    # Get the first 5 articles
    articles = data["articles"][:20]

    return articles


def main():
    query = "Artificial Intelligence"
    api_key = os.getenv("NEWSAPI")
    articles = get_news(query, api_key)

    output = []
    for i, article in enumerate(articles, 1):
        output.append({
            'title': '"'+article['title'] + '"',
            'url': article['url'],
            'source': 'source... '+article['source']['name'],
            'publishedAt': article['publishedAt'],
        })

    # Reverse the list to go from least popular to most popular
    output.reverse()

    # Save the data to a JSON file
    with open('generated_script.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4)


if __name__ == "__main__":
    main()
