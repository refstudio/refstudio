import { atom, createStore } from 'jotai';

import * as s2SearchAPI from '../../../api/s2SearchAPI';
import * as S2SearchState from '../../../atoms/s2SearchState';
import { noop } from '../../../lib/noop';
import { render, screen, setupWithJotaiProvider, waitFor } from '../../../test/test-utils';
import { S2SearchModal, SearchResult } from '../S2SearchModal';

const searchResults = [
  {
    title: 'P. Biagi, B.A. Voytek 2018 - THE CHIPPED STONE ASSEMBLAGES FROM ARMA DELL’AQUILA (FINALE LIGURE, SAVONA)',
    year: 2018,
    abstract:
      'The chipped stone assemblage from the excavations carried out by C. Richard at Arma dell’Aquila consists of a small number of artefacts retrieved from both the Neolithic and Upper Palaeolithic (Early Epigravettian and Aurignacian) layers. The artefacts were obtained from several raw material sources, which varied according to the different occupation periods. The industry has been studied from both typological and traceological points of view, in order to interpret the local or non-local manufacture of the chipped stone tools, and understand the activities carried out throughout the different periods during which the site was settled. Parole chiave – Industrie litiche scheggiate, Provenienza della materia prima, Tipologia, Tracce d’uso, Funzione',
    venue: '',
    publicationDate: '',
    paperId: '70d1cf9ff36dc4627cf9dd4d439133bd92c20cfe',
    citationCount: 0,
    openAccessPdf: '',
    authors: ['P. Biagi', 'B. Voytek'],
  },
  {
    title:
      'Do Zombies Dream of Undead Sheep? A Neuroscientific View of the Zombie Brain by Timothy Verstynen, Bradley Voytek (review)',
    year: 2016,
    abstract: '',
    venue: '',
    publicationDate: '2016-04-06T00:00:00',
    paperId: '8d2142ec0e16b8ac68e939deb3ea5845b24b28b1',
    citationCount: 0,
    openAccessPdf: '',
    authors: ['B. Smith'],
  },
  {
    title: 'Inferring synaptic excitation/inhibition balance from field potentials',
    year: 2016,
    abstract:
      'Neural circuits sit in a dynamic balance between excitation (E) and inhibition (I). Fluctuations in this E:I balance have been shown to influence neural computation, working memory, and information processing. While more drastic shifts and aberrant E:I patterns are implicated in numerous neurological and psychiatric disorders, current methods for measuring E:I dynamics require invasive procedures that are difficult to perform in behaving animals, and nearly impossible in humans. This has limited the ability to examine the full impact that E:I shifts have in neural computation and disease. In this study, we develop a computational model to show that E:I ratio can be estimated from the power law exponent (slope) of the electrophysiological power spectrum, and validate this relationship using previously published datasets from two species (rat local field potential and macaque electrocorticography). This simple method--one that can be applied retrospectively to existing data--removes a major hurdle in understanding a currently difficult to measure, yet fundamental, aspect of neural computation.',
    venue: 'NeuroImage',
    publicationDate: '2016-10-16T00:00:00',
    paperId: '0a2c3202a9c4c4f7709eeed324ca53e12ad4af72',
    citationCount: 357,
    openAccessPdf: 'https://www.biorxiv.org/content/biorxiv/early/2016/10/16/081125.full.pdf',
    authors: ['Richard Gao', 'E. Peterson', 'Bradley Voytek'],
  },
];

global.CSS.supports = () => false;

vi.mock('../../events');
vi.mock('../../api/s2SearchAPI');
vi.mock('../../../atoms/referencesState');

vi.mock('../../../atoms/s2SearchState', async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    loadSearchResultsAtom: atom(null, async (get, set, keywords: string, limit?: number) => {
      set(S2SearchState.searchResultsAtom, searchResults);
    }),
  };
});

describe('S2SearchModal component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal CLOSED (empty)', () => {
    const { container } = render(<S2SearchModal open={false} onClose={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render search bar', () => {
    render(<S2SearchModal open onClose={noop} />);
    expect(screen.getByPlaceholderText('Search Semantic Scholar...')).toBeInTheDocument();
  });

  it('should render Semantic Scholar search prompt', () => {
    render(<S2SearchModal open onClose={noop} />);
    expect(
      screen.getByText('Enter keywords above to search Semantic Scholar for references to add to your library.'),
    ).toBeInTheDocument();
  });

  it('should render S2 search results list', async () => {
    const store = createStore();

    const { user } = setupWithJotaiProvider(<S2SearchModal open onClose={noop} />, store);
    const searchBar = screen.getByPlaceholderText('Search Semantic Scholar...');
    await user.type(searchBar, 'voytek');

    await waitFor(() => {
      expect(screen.getByText(searchResults[0].title)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(searchResults[1].title)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(searchResults[2].title)).toBeInTheDocument();
    });
  });

  it('should show noPDF icon for references without a openAccessPdf', async () => {
    const store = createStore();

    const { user } = setupWithJotaiProvider(<S2SearchModal open onClose={noop} />, store);
    const searchBar = screen.getByPlaceholderText('Search Semantic Scholar...');
    await user.type(searchBar, 'voytek');

    await waitFor(() => {
      expect(screen.getAllByTitle('This reference has no PDF. Chat functions will be limited.').length).toBe(2);
    });
  });

  const postS2ReferenceSpy = vi.spyOn(s2SearchAPI, 'postS2Reference');

  it('should attempt to add the reference', async () => {
    const store = createStore();

    const { user } = setupWithJotaiProvider(<SearchResult projectId="000" reference={searchResults[0]} />, store);
    await user.click(screen.getByTitle('Add this reference to your references list'));

    await waitFor(() => {
      expect(postS2ReferenceSpy).toHaveBeenCalledTimes(1);
    });
  });
});
