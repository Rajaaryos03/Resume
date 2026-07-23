"use client";

import { useState, useEffect, useCallback } from "react";
import { GitCommit, GitPullRequest, AlertCircle, Star, GitFork, ExternalLink, Loader2, RefreshCw } from "lucide-react";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
}

interface Repo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string } | null;
  isArchived: boolean;
}

interface GitHubData {
  name: string;
  bio: string | null;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { nodes: Repo[] };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: ContributionDay[] }[];
    };
  };
}

const levelColors: Record<ContributionDay["contributionLevel"], string> = {
  NONE:            "bg-white/5",
  FIRST_QUARTILE:  "bg-[#0e4429]",
  SECOND_QUARTILE: "bg-[#006d32]",
  THIRD_QUARTILE:  "bg-[#26a641]",
  FOURTH_QUARTILE: "bg-[#39d353]",
};

export default function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github");
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to load");
      setData(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!username) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        Set <code className="font-mono text-[#56CCF2]">NEXT_PUBLIC_GITHUB_USERNAME</code> to enable GitHub Activity.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-10">
        <AlertCircle size={28} className="mx-auto mb-2 text-red-400" />
        <p className="text-slate-400 text-sm mb-3">{error ?? "Could not load GitHub data."}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 text-xs text-[#56CCF2] hover:text-white transition-colors"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const { contributionCalendar, totalCommitContributions, totalPullRequestContributions, totalIssueContributions } =
    data.contributionsCollection;

  const weeks = contributionCalendar.weeks.slice(-26); // last 6 months

  return (
    <div className="space-y-8">
      {/* Header + stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GithubIcon size={20} />
          <div>
            <p className="text-white font-semibold">{data.name ?? username}</p>
            {data.bio && <p className="text-slate-400 text-xs">{data.bio}</p>}
          </div>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-[#56CCF2] hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span><strong className="text-white">{data.followers.totalCount}</strong> followers</span>
          <span><strong className="text-white">{data.following.totalCount}</strong> following</span>
        </div>
      </div>

      {/* Contribution stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Contributions (year)", value: contributionCalendar.totalContributions, icon: GitCommit, color: "text-green-400" },
          { label: "Commits",   value: totalCommitContributions,       icon: GitCommit,      color: "text-blue-400" },
          { label: "PRs",       value: totalPullRequestContributions,  icon: GitPullRequest, color: "text-purple-400" },
          { label: "Issues",    value: totalIssueContributions,        icon: AlertCircle,    color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
            <s.icon size={15} className={`${s.color} mb-1.5`} />
            <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contribution calendar */}
      <div>
        <p className="text-xs text-slate-400 mb-3">
          {contributionCalendar.totalContributions.toLocaleString()} contributions in the last year
        </p>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.contributionDays.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? "s" : ""}`}
                    className={`w-3 h-3 rounded-sm ${levelColors[day.contributionLevel]} transition-colors hover:ring-1 hover:ring-white/30`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <span>Less</span>
          {Object.values(levelColors).map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Top repos */}
      {data.repositories.nodes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Top Repositories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.repositories.nodes.slice(0, 4).map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 hover:border-white/20 transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-white group-hover:text-[#56CCF2] transition-colors truncate">
                    {repo.name}
                  </p>
                  <ExternalLink size={12} className="text-slate-500 group-hover:text-[#56CCF2] shrink-0 mt-0.5 transition-colors" />
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {repo.primaryLanguage && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: repo.primaryLanguage.color }}
                      />
                      {repo.primaryLanguage.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={11} /> {repo.stargazerCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={11} /> {repo.forkCount}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
