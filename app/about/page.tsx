import type { Metadata } from "next";

import { StoryBook } from "@/components/story-book";
import type { StoryBookPage } from "@/components/story-book";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of the Technocrats Developer Community, told in a book — why we exist, what we teach and where we are headed.",
};

const storyPages: StoryBookPage[] = [
  {
    id: 1,
    front: {
      variant: "cover",
      kicker: "tdc / journal of a community",
      title: "Technocrats Developer Community",
      body: "a story told in pages",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    back: {
      kicker: "chapter 01 · the beginning",
      title: "Three friends, one idea",
      body: "Annand Soni, Ankit Kumar and Ankit Sharma looked around the campus and saw developers in the crowd — but no crowd of developers. Everyone was learning alone. They started TDC so that stopped.",
    },
  },
  {
    id: 2,
    front: {
      kicker: "chapter 02 · the why",
      title: "Juniors deserve real guidance",
      body: "The gap between a syllabus and the real world is wide. TDC exists to close it: seniors hand down what actually works, in the words they wish someone had said to them. No gatekeeping, no ego — just the desk next to yours.",
    },
    back: {
      kicker: "chapter 03 · what we teach",
      title: "Web, apps, AI/ML, security, DSA",
      body: "Five tracks, one floor. Web builds the front door, apps put it in a pocket, AI/ML gives it a brain, security keeps it honest and DSA sharpens the person behind it all. Pick one, then show up and build.",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      caption: "a few hours of a sprint, compressed",
    },
  },
  {
    id: 3,
    front: {
      kicker: "chapter 04 · how we work",
      title: "Workshops, sprints, honest review",
      body: "Every week there is a session, most weeks there is a build. Code gets reviewed the way we would want ours reviewed: specific, kind and demanding. Small teams, real deadlines, no one steamrolled by the loudest voice.",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      caption: "the workshop floor on a wednesday",
    },
    back: {
      kicker: "chapter 05 · the community",
      title: "Open study groups and demo nights",
      body: "Anyone at Technocrats can walk in and sit down. Study groups run on whoever shows up; demo nights run on whatever got finished. Half of membership is simply the discipline of coming back next week.",
      image:
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
      caption: "demo night, laptop side",
    },
  },
  {
    id: 4,
    front: {
      kicker: "chapter 06 · placements",
      title: "The interview grind, together",
      body: "DSA drills, mock interviews and resume walks — run by seniors who have lived the cycle and are happy to share the map. The target is never a certificate; it is a body of work you can defend in a room.",
    },
    back: {
      kicker: "chapter 07 · hack nights",
      title: "Hack nights and demo days",
      body: "The classics. A problem on the board, a timer on the wall, a floor full of laptops. By morning there are broken builds, working demos and a handful of ideas that survive into real projects.",
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      caption: "the floor at midnight, an hour to demo",
    },
  },
  {
    id: 5,
    front: {
      kicker: "chapter 08 · open source",
      title: "Building in public",
      body: "Past the workshops live real repos: event platforms, this very website, tools for the college and experiments that go nowhere on purpose. Open source teaches the hardest lesson — shipping to strangers.",
    },
    back: {
      kicker: "chapter 09 · mentors",
      title: "Seniors who stick around",
      body: "Graduation does not end membership. Former members come back for review nights, refer juniors to teams and answer DMs that are half question, half 'I made a thing'. The network compounds every year.",
    },
  },
  {
    id: 6,
    front: {
      kicker: "chapter 10 · journeys",
      title: "Beginners who shipped",
      body: "Somebody walks in as a first-semester beginner, nervous about a terminal. Two years later they are running the workshop that once scared them. We have watched this loop close often enough to bet on it.",
    },
    back: {
      kicker: "chapter 11 · growth",
      title: "Same people, bigger rooms",
      body: "TDC started as three friends in a room. It has grown into study tables, event floors and a mailing list that actually gets opened. The circle widens, and the people who started it never leave it.",
    },
  },
  {
    id: 7,
    front: {
      kicker: "chapter 12 · the vision",
      title: "A body of work to show",
      body: "When students leave Technocrats, they should be able to open a repo or a portfolio and point at what they made. Success is measured in shipped things, not certificates. The rest is decoration.",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      caption: "where the track heads",
    },
    back: {
      kicker: "chapter 13 · join us",
      title: "Bring a laptop and an idea",
      body: "There is no form to fill and no bar to clear. Come to a session, sit anywhere, meet the people building. Join for the projects, stay for the people, and leave the campus a little more awake.",
    },
  },
  {
    id: 8,
    front: {
      variant: "end",
      kicker: "endplate",
      title: "Your page",
      body: "This book is only half written. The next leaf belongs to someone who showed up to a workshop and never left. That person could be you.",
      image:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    },
    back: {
      variant: "end",
      kicker: "tdc / back cover",
      title: "Built by students, for students",
      body: "Technocrats Developer Community · Technocrats Institute of Technology (Excellence), Bhopal. See you at the next session.",
      image:
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    },
  },
];

export default function AboutPage() {
  return (
    <Section className="tdc-reveal">
      <SectionHeading
        eyebrow="About"
        title="The story of TDC, in a book"
        description="Flip through how TDC came to be, what we teach and where it is headed."
        className="mb-10"
      />
      <StoryBook
        pages={storyPages}
        pageWidth={420}
        pageHeight={600}
        autoplay
        autoplayInterval={6000}
        pauseOnHover
        accentColor="var(--primary)"
      />
    </Section>
  );
}