import sys

def count_tags(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        div_opens = content.count('<div ') + content.count('<div>')
        div_closes = content.count('</div>')
        
        section_opens = content.count('<section ') + content.count('<section>')
        section_closes = content.count('</section>')
        
        p_opens = content.count('<p ') + content.count('<p>')
        p_closes = content.count('</p>')

        span_opens = content.count('<span ') + content.count('<span>')
        span_closes = content.count('</span>')
        
        print(f"div: {div_opens} / {div_closes}")
        print(f"section: {section_opens} / {section_closes}")
        print(f"p: {p_opens} / {p_closes}")
        print(f"span: {span_opens} / {span_closes}")
    except Exception as e:
        print(e)

count_tags('/Users/abhiram/Documents/unheard/app/about/page.tsx')
