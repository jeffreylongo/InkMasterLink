import csv, json, os

# Always resolve relative to this script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
input_path = os.path.join(BASE_DIR, "../data/tattoo_shops.csv")
output_path = os.path.join(BASE_DIR, "../public/tattoo_shops.json")

shops = []

with open(input_path, newline='', encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    reader.fieldnames = [h.strip().lower() for h in reader.fieldnames]

    for row in reader:
        website = row.get("website", "").strip() or row.get(" website", "").strip()
        email = row.get("email", "").strip() or row.get(" email", "").strip()

        shops.append({
            "zip": row.get("searched_zip", "").strip(),
            "name": row.get("business_name", "").strip(),
            "address": row.get("address", "").strip(),
            "phone": row.get("phone", "").strip(),
            "rating": row.get("rating", "").strip(),
            "reviews": row.get("reviews", "").strip(),
            "website": website,
            "email": email
        })

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(shops, f, indent=2)

print(f"✅ {len(shops)} records saved to {output_path}")
