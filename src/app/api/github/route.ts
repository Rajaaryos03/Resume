import { NextResponse } from "next/server";

export async function GET() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  if (!username) {
    return NextResponse.json({ error: "NEXT_PUBLIC_GITHUB_USERNAME not set" }, { status: 400 });
  }

  try {
    // Fetch user info + pinned repos (GraphQL) + contribution calendar
    const query = `
      query($login: String!) {
        user(login: $login) {
          name
          bio
          followers { totalCount }
          following { totalCount }
          repositories(first: 6, orderBy: { field: STARGAZERS, direction: DESC }, ownerAffiliations: OWNER, privacy: PUBLIC) {
            nodes {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage { name color }
              isArchived
            }
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 3600 }, // cache 1h
    });

    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status}`);
    }

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL error");

    return NextResponse.json(json.data.user, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
