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
      body: "Annand Soni, Ankit Kumar and Ankit Sharma looked around and saw developers in the crowd, but no crowd of developers. They started TDC so that talent on the campus stopped staying quiet.",
    },
  },
  {
    id: 2,
    front: {
      kicker: "chapter 02 · the why",
      title: "Juniors deserve real guidance",
      body: "The gap between what a syllabus teaches and what the world runs on is wide. TDC closes it — older students hand down what actually works, in words they wish someone had said to them. No gatekeeping, no ego. Just the desk next to yours.",
    },
    back: {
      kicker: "chapter 03 · what we teach",
      title: "Web, apps, AI/ML, security, DSA",
      body: "Five tracks, one floor: web builds the front door, apps put it in a pocket, AI/ML gives it a brain, security keeps it honest and DSA sharpens the person behind it. Pick one, then show up and build.",
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
      body: "Every week there is a session, and most weeks there is a build. We review code the way we would want ours reviewed — specific, kind and demanding. Small teams, real deadlines, no salvaged by the loudest voice.",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      caption: "the workshop floor on a wednesday",
    },
    back: {
      kicker: "chapter 05 · the community",
      title: "Open study groups and demo nights",
      body: "Anyone at Technocrats can walk in and sit down. The study groups run on whoever shows up, and demo nights run on whatever got finished. Half of membership is the discipline of coming back next week.",
      image:
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
      caption: "demo night, laptop side",
    },
  },
  {
    id: 4,
    front: {
      kicker: "chapter 06 · the vision",
      title: "A body of work to show",
      body: "By the time students leave, they should be able to open a repo or a portfolio and point at what they made. That is the whole point: we measure success in shipped things, not in certificates.",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      caption: "where the track heads",
    },
    back: {
      kicker: "chapter 07 · join us",
      title: "Bring a laptop and an idea",
      body: "There is no form to fill and no bar to clear. Come to a session, sit anywhere, meet the people building. Join for the projects, stay for the people, and leave the campus a little more awake than you found it.",
    },
  },
  {
    id: 5,
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
      body: "Technocrats Developer Community · Technocrats Institute of Technology (Excellence), Bhopal · see you at the next session.",
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
        pageWidth={340}
        pageHeight={480}
        autoplay
        autoplayInterval={6000}
        pauseOnHover
        accentColor="var(--primary)"
      />
    </Section>
  );
}