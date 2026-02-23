import { Hero } from "../types/marvel";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let message = "API error";
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } else {
      const errorText = await response.text();
      if (errorText) message = errorText;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
};

export type HeroesResponse = {
  data: Hero[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    count: number;
  };
};

export const getHeroes = (params: {
  search?: string;
  page?: number;
  pageSize?: number;
  category?: string;
}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  return request<HeroesResponse>(`/api/heroes?${query.toString()}`);
};

export const getHero = (id: string) => request<{ data: Hero }>(`/api/heroes/${id}`);
