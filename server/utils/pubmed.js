import axios from "axios";
import { parseStringPromise } from "xml2js";

export const searchPubMed = async (query) => {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`;
    const res = await axios.get(url, {
      params: {
        db: "pubmed",
        term: query,
        retmode: "json",
        retmax: 5, // fetch top 5
      },
    });

    return res.data?.esearchresult?.idlist || [];
  } catch (err) {
    console.error("PubMed search error:", err.message);
    return [];
  }
};

export const fetchPubMedDetails = async (idList) => {
  if (!idList || !idList.length) return [];

  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`;
    const res = await axios.get(url, {
      params: {
        db: "pubmed",
        id: idList.join(","),
        retmode: "xml",
      },
    });

    // Parse XML
    const result = await parseStringPromise(res.data, { explicitArray: true });

    // Extract useful fields
    const articles =
      result?.PubmedArticleSet?.PubmedArticle?.map((article) => {
        const medline = article?.MedlineCitation?.[0]?.Article?.[0];

        // Title (safe fallback)
        const title = medline?.ArticleTitle?.[0] || "";

        // Abstract (can be missing)
        let abstract = "";
        if (medline?.Abstract?.[0]?.AbstractText) {
          abstract = medline.Abstract[0].AbstractText.map((t) =>
            typeof t === "string" ? t : t._ || ""
          ).join(" ");
        }

        // Build clean doc
        return {
          pmid: article?.MedlineCitation?.[0]?.PMID?.[0]?._ || "",
          title: title || "",
          abstract: abstract || "",
          content: `${title || ""}. ${abstract || ""}`.trim(),
        };
      }) || [];

    // Only return valid ones
    return articles.filter((a) => a.content && a.content.length > 0);
  } catch (err) {
    console.error("❌ PubMed fetch error:", err.message);
    return [];
  }
};
