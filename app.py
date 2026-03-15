from flask import Flask, render_template, request, jsonify
import language_tool_python
import os

app = Flask(__name__)

# Initialize grammar tool once
tool = language_tool_python.LanguageTool('en-US')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/check', methods=['POST'])
def check_grammar():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Invalid request data'}), 400

        text = data.get('text', '').strip()

        if not text:
            return jsonify({'error': 'Please enter some text'}), 400

        matches = tool.check(text)
        corrected_text = language_tool_python.utils.correct(text, matches)

        return jsonify({
            'original': text,
            'corrected': corrected_text,
            'issues_found': len(matches)
        })

    except Exception as e:
        return jsonify({'error': f'Grammar checking failed: {str(e)}'}), 500


@app.route('/save', methods=['POST'])
def save_file():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Invalid request data'}), 400

        filename = data.get('filename', 'corrected.txt').strip()
        content = data.get('content', '').strip()

        if not content:
            return jsonify({'error': 'No corrected text to save'}), 400

        # Default save location: Downloads folder
        home_dir = os.path.expanduser("~")
        downloads_dir = os.path.join(home_dir, "Downloads")

        # Ensure .txt extension
        if not filename.endswith('.txt'):
            filename += '.txt'

        file_path = os.path.join(downloads_dir, filename)

        os.makedirs(downloads_dir, exist_ok=True)

        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

        return jsonify({
            'success': True,
            'message': 'File saved successfully',
            'filepath': file_path
        })

    except Exception as e:
        return jsonify({'error': f'File saving failed: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)