from ayurveda_models import SimpleDocument
from ayurveda_processor import SimpleSearchEngine
from pathlib import Path
import functools

_results_cache = {}

class SimpleDocument:
    """Simple document class for text retrieval."""
    def __init__(self, page_content, metadata=None):
        self.page_content = page_content
        self.metadata = metadata or {}

def retrieve_ayurvedic_knowledge(query, category=None, text_name=None, focus_area=None, k=5):
    """Retrieve relevant Ayurvedic knowledge for a query with focus area prioritization.
    
    Parameters:
    -----------
    query : str
        The search query text
    category : str, optional
        Filter by document category (e.g., "Ayurvedic Classic", "Yoga Text")
    text_name : str, optional
        Filter by specific text name
    focus_area : str, optional
        Prioritize texts based on focus area (e.g., "dinacharya", "ahara", "yoga")
    k : int, optional
        Maximum number of results to return
        
    Returns:
    --------
    tuple
        (list of document objects, context string for Claude)
    """
    engine = SimpleSearchEngine()
    
    # Map focus areas to recommended texts
    focus_area_texts = {
        "dinacharya": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha", "SushruthaSamhita"],
        "ahara": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha", "SushruthaSamhita"],
        "nidra": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha"],
        "vyayama": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha", "HathaYogaPradipika"],
        "yoga": ["HathaYogaPradipika", "GherandaSamhita", "YogaYajnavalkya"],
        "pranayama": ["HathaYogaPradipika", "GherandaSamhita", "ShivaSamhita", "YogaYajnavalkya"],
        "meditation": ["YogaSutras", "GherandaSamhita", "YogaYajnavalkya"],
        "ritucharya": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha", "SushruthaSamhita"],
        "rasayana": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha"],
        "sadvritta": ["CharakaSamhita", "AshtangaHridaya", "Bhavaprakasha", "YogaSutras", "YogaYagnavalkya"]
    }
    
    # If focus area is provided, try to get results from preferred texts first
    if focus_area and focus_area in focus_area_texts:
        preferred_texts = focus_area_texts[focus_area]
        
        # First attempt: search only in preferred texts
        results = []
        for text in preferred_texts:
            text_results, _ = engine.search(query, k=2, text_name=text)
            results.extend(text_results)
            
        # If we got enough results, use them
        if len(results) >= min(3, k):
            # Deduplicate and limit to k results
            seen_ids = set()
            unique_results = []
            for doc in results:
                doc_id = doc.metadata.get('chunk_id', id(doc))  # Use object id as fallback
                if doc_id not in seen_ids:
                    seen_ids.add(doc_id)
                    unique_results.append(doc)
                    if len(unique_results) >= k:
                        break
                        
            # Format context for Claude
            context = "\n\n".join([
                f"Source: {doc.metadata.get('text_name', 'Unknown')}\n"
                f"Section: {doc.metadata.get('section', 'General')}\n"
                f"Category: {doc.metadata.get('category', 'Unknown')}\n"
                f"Content: {doc.page_content}"
                for doc in unique_results
            ])
            
            return unique_results, context
    
    # If we get here, either no focus area was provided or not enough results were found
    # Fall back to standard search
    results, context = engine.search(query, k=k, category=category, text_name=text_name)
    
    # If still not enough results and we had a focus area, try without any restrictions
    if len(results) < min(2, k) and focus_area:
        print(f"Insufficient results for {query} in focus area {focus_area}, trying general search")
        fallback_results, fallback_context = engine.search(query, k=k)
        
        # Combine results
        all_results = results + fallback_results
        
        # Deduplicate and limit to k results
        seen_ids = set()
        unique_results = []
        for doc in all_results:
            doc_id = doc.metadata.get('chunk_id', id(doc))
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                unique_results.append(doc)
                if len(unique_results) >= k:
                    break
        
        # Rebuild context
        context = "\n\n".join([
            f"Source: {doc.metadata.get('text_name', 'Unknown')}\n"
            f"Section: {doc.metadata.get('section', 'General')}\n"
            f"Category: {doc.metadata.get('category', 'Unknown')}\n"
            f"Content: {doc.page_content}"
            for doc in unique_results
        ])
        
        return unique_results, context
    
    return results, context

def cached_retrieve(query, category=None, text_name=None, focus_area=None, k=5):
    """Cached wrapper for retrieve_ayurvedic_knowledge"""
    # Check cache first
    cache_key = f"{query}_{category}_{text_name}_{focus_area}_{k}"
    if cache_key in _results_cache:
        return _results_cache[cache_key]
    
    # Try quick search first
    engine = SimpleSearchEngine()
    found, response = engine.quick_search(query)
    if found:
        # Create a simple document with the response
        doc = SimpleDocument(
            page_content=response,
            metadata={"source": "Quick lookup", "text_name": "Ayurvedic Knowledge", "category": "Overview"}
        )
        results = [doc]
        context = response
        _results_cache[cache_key] = (results, context)
        return results, context
    
    # Call the original function if quick search didn't find anything
    results, context = retrieve_ayurvedic_knowledge(query, category, text_name, focus_area, k)
    
    # Cache the results
    _results_cache[cache_key] = (results, context)
    return results, context

def retrieve_by_dosha(dosha, topic=None, k=5):
    """Specialized retrieval for dosha-related questions."""
    query = f"Ayurvedic information about {dosha} dosha"
    if topic:
        query += f" regarding {topic}"
    
    return retrieve_ayurvedic_knowledge(query, category="Ayurvedic Classic", k=k)

def retrieve_yoga_knowledge(asana=None, text=None, k=5):
    """Specialized retrieval for yoga texts."""
    if asana:
        query = f"Yoga information about {asana}"
    else:
        query = "Yoga philosophy and practice"
    
    return retrieve_ayurvedic_knowledge(query, category="Yoga Text", text_name=text, k=k)

if __name__ == "__main__":
    # Example usage
    results, context = retrieve_ayurvedic_knowledge("What are the characteristics of Vata dosha?")
    print(f"Found {len(results)} relevant passages")
    print(context[:500] + "...")  # Print first 500 chars of the context