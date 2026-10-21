# Bulk import

Admin > **Bulk import** adds many works at once from a JSON file.

## Format

An array of projects, or an object with a `works` array:

```json
{
  "works": [
    {
      "title": "Medieval Castle",
      "description": "A hilltop fortress with a working drawbridge.",
      "category": "Environments",
      "images": ["castle-1.png", "castle-2.png"],
      "tools": "Roblox Studio",
      "tags": "build, medieval",
      "published": true
    }
  ]
}
```

| Field | Notes |
| --- | --- |
| `title` | Required. A project with the same title as an existing one is skipped or updated (your choice in the preview). |
| `description` | Shown over the image when the card flips. Keep it short. |
| `category` | Category name. Created automatically if it does not exist. |
| `images` | List of file names, URLs or absolute paths. The first one is the cover. Bare file names resolve to `/uploads/<name>`, or to the image files dropped in the importer. |
| `tools`, `tags` | Text, or a list (joined with commas). |
| `published` | `true` by default. `false` keeps it as a hidden draft. |

## Workflow

1. Put the images in `public/uploads/` (or drop them in the importer's image box).
2. Write or generate the JSON and paste it in the importer.
3. Check the preview (missing images and fields are flagged), then import.

The importer works the same with the local files backend and with Supabase.
