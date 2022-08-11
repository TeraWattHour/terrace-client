import { classes } from "../../utils/classes";
import styles from "./Topbar.module.scss";
import { API } from "../../consts/api";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { borzoi } from "borzoi";

const fetchLists = async (term: string) => {
  const { data, ok } = await borzoi(`${API}/list`, {
    query: {
      term,
    },
  });
  if (!ok || !data?.data) throw new Error();

  return data.data;
};

export const Topbar = () => {
  let results: React.RefObject<HTMLDivElement> = useRef(null);
  let wrapper: React.RefObject<HTMLDivElement> = useRef(null);
  let searchInput: React.RefObject<HTMLInputElement> = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foundLists, setFoundLists] = useState<any[]>([]);

  const handleSearch = async () => {
    const term = searchInput.current?.value;
    if (!term) {
      setSearching(false);
      return setSearchTerm("");
    }

    setLoading(true);
    setSearchTerm(term);

    setSearching(true);

    const found = await fetchLists(term);
    setFoundLists(found);

    setLoading(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (!wrapper.current) return;
        if (
          e.target.contains(wrapper.current) ||
          wrapper.current.contains(e.target)
        ) {
          return;
        }
        setFoundLists([]);
        setSearchTerm("");
        setSearching(false);
      }
    };
    const handleFocus = (e: KeyboardEvent) => {
      if (
        e.key !== "/" ||
        !searchInput.current ||
        document.activeElement === searchInput.current
      )
        return;
      e.preventDefault();
      searchInput.current.focus();
    };

    window.addEventListener("click", handler);
    window.addEventListener("keydown", handleFocus);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handleFocus);
    };
  }, []);

  return (
    <div ref={wrapper} className={styles.wrapper}>
      <div className={styles.container}>
        <input
          ref={searchInput}
          type="search"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          name="discover-places"
          className={styles["discover_input"]}
          placeholder="Discover places! Press Enter to search"
        />
        <div className={styles["buttons_container"]}>
          <button
            onClick={() => handleSearch()}
            className={styles["search_button"]}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 sm:h-6 w-5 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      {searching && (
        <div ref={results} className={styles["results"]}>
          {loading && <ResultsLoading />}
          {!loading && foundLists.length === 0 && <ResultsNotFound />}
          {!loading && foundLists.length > 0 && (
            <div className="flex flex-col space-y-1">
              {foundLists.map((list) => (
                <Link
                  onClick={() => {
                    setSearching(false);
                    setFoundLists([]);
                  }}
                  key={list.id}
                  to={`/?listId=${list.id}`}
                  className={classes(
                    styles["results__entry"],
                    "flex items-center space-x-3 flex-row py-2"
                  )}
                >
                  {list.thumbnailUrl && (
                    <img
                      src={list.thumbnailUrl}
                      className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-stone-200"
                      alt=""
                    />
                  )}
                  <span>{list.name}</span>
                </Link>
              ))}
            </div>
          )}
          <Link to="/list/add-list" className={styles["results__action"]}>
            Not what you are looking for? Add new list!
          </Link>
        </div>
      )}
    </div>
  );
};

const ResultsNotFound = () => {
  return (
    <div className={styles["results__empty"]}>
      <strong className="text-xl">Kapitän! Are you drunk?</strong>
      <span>There's no such thing!</span>
    </div>
  );
};

const ResultsLoading = () => {
  return (
    <div className="flex items-center justify-center w-full py-10">
      <i className="fal fa-wrench animate-spin text-3xl"></i>
    </div>
  );
};
