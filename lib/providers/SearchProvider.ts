export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface SearchProvider {
  name: string;
  isAvailable(): boolean;
  search(query: string, limit?: number): Promise<SearchResult[]>;
}

export class FallbackSearchProvider implements SearchProvider {
  name = "Fallback";

  isAvailable(): boolean {
    return false;
  }

  async search(query: string, limit?: number): Promise<SearchResult[]> {
    throw new Error("Web Search is currently unavailable.");
  }
}

// In the future, we would implement TavilyProvider, ExaProvider, etc.
// export class TavilyProvider implements SearchProvider { ... }
