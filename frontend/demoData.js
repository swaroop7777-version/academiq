// Demo mode responses — used when the real Barkla backend is not reachable.
// These are realistic example answers drawn from real COMP516 and COMP315 content.

export const DEMO_MODE_BANNER = `🎓 Demo mode — the live AI backend (Mistral 7B on Barkla GPU) is not active right now.
Showing example responses. To see live answers, the backend needs to be running on the GPU cluster.`;

export const DEMO_TUTOR_RESPONSES = {
  COMP516: [
    {
      trigger: ["positivism", "interpretivism", "paradigm", "research paradigm"],
      answer: `Positivism and interpretivism are two distinct research paradigms used in Computer Science and social science research.

Positivism assumes that reality is objective and measurable. It favours quantitative methods such as experiments, surveys, and statistical analysis to obtain data and draw conclusions based on observable facts. A positivist researcher aims to discover universal laws and patterns through controlled, repeatable methods.

Interpretivism, by contrast, assumes that reality is socially constructed and that meaning is created through human experience. It favours qualitative methods such as interviews, observations, and case studies. An interpretivist researcher focuses on understanding the lived experience of participants rather than measuring variables.

In the context of COMP516, the choice of paradigm shapes the entire research design — from the research question through to the methods used and the way findings are reported.`,
      sources: ["lect2", "lect3"]
    },
    {
      trigger: ["systematic", "literature review", "narrative review"],
      answer: `A systematic literature review follows a predefined, reproducible protocol to identify, appraise and synthesise all relevant research on a topic. Unlike a narrative review, it is designed to minimise bias by documenting the search strategy, inclusion and exclusion criteria, and the process by which papers were selected.

A narrative review, by contrast, is a broader, less rigorous summary of the literature that reflects the author's judgement about which sources are relevant. It is more flexible but less replicable.

For COMP516, a systematic review is generally preferred for research projects because it demonstrates methodological rigour and allows other researchers to verify and build on your findings.`,
      sources: ["lect4", "lect6"]
    }
  ],
  COMP315: [
    {
      trigger: ["kubernetes", "container", "orchestration"],
      answer: `Kubernetes is an open-source container orchestration platform originally designed by engineers at Google and released publicly in 2014. Its primary goal is to make cloud software portable between different cloud providers, freeing organisations from vendor lock-in.

Kubernetes was inspired by Google's internal systems Borg and Omega, which managed billions of containers across Google's infrastructure. It simplifies the process of deploying, scaling, and managing containerised applications across a cluster of machines.

In the context of COMP315, Kubernetes acts as a Platform as a Service (PaaS) layer: the service provider manages the underlying infrastructure, while users focus on deploying their applications using \`kubectl\` and YAML configuration files. Lab exercises in this module cover starting Minikube locally and deploying pods, deployments, and services.`,
      sources: ["Comp315 Lecture 3 Draft", "Comp315 Lecture 7 Final", "Lab 4 - Kubernetes"]
    },
    {
      trigger: ["docker", "container", "image"],
      answer: `Docker is a platform for developing, shipping, and running applications in containers. A container packages an application together with all its dependencies — libraries, configuration, runtime — into a single, portable unit that runs consistently across different environments.

Unlike a virtual machine, which emulates an entire operating system, a Docker container shares the host operating system's kernel and runs as an isolated process. This makes containers much lighter and faster to start than virtual machines.

In COMP315, Docker is used as the foundation for understanding cloud-native deployment. You build a Docker image from a Dockerfile, run it as a container, and later orchestrate multiple containers using Kubernetes.`,
      sources: ["Comp315 Lecture 1", "Comp 315 Lab 1"]
    }
  ]
};

export const DEMO_SOLVE_RESPONSES = {
  solve: `Here is a step-by-step worked solution based on the course material:

Step 1 — Identify the core concept being tested. Read the question carefully to determine which topic from the lectures it is examining.

Step 2 — Recall the relevant definition or framework from the course. For this type of question, the key points are drawn from the lecture material on this specific topic.

Step 3 — Structure your answer. Begin with a direct definition, then provide supporting detail, and conclude with an example or application where relevant.

Step 4 — Check your answer covers all mark-scheme points. For a question of this weight, markers typically look for: the correct definition, at least one supporting detail, and either an example or a contrast with a related concept.

Note: This is a demo response. With the live backend running on Barkla, the answer would be generated directly from your own COMP315 or COMP516 lecture notes.`,

  realworld: `This concept has several important real-world applications that are directly relevant to careers in software engineering and cloud computing:

Industry application: Large technology companies including Google, Amazon, and Microsoft use this exact approach to manage their production infrastructure at scale. The principles you are learning in this module are used daily by millions of engineers worldwide.

Career relevance: Proficiency with these technologies is consistently listed among the most in-demand skills in cloud computing and DevOps roles. Understanding both the theoretical underpinning and the practical implementation gives you a significant advantage in technical interviews.

Emerging trends: The field is moving towards greater automation and abstraction, with tools like Kubernetes Operators and GitOps workflows building directly on the foundations covered in this course.

Note: This is a demo response. With the live Mistral 7B backend running, the real-world explanation would be grounded specifically in your course material and tailored to the exact passage you selected.`,

  explain: `Here is a simple explanation of this concept:

Think of it this way: imagine you have a very large library of books, and someone asks you a question. Instead of reading every book to find the answer, you have an intelligent index that can point you directly to the most relevant pages. That is essentially what this system does with your lecture notes.

The key idea to remember is that the approach solves a specific problem — it makes something that was previously difficult or slow into something fast and reliable, by being clever about how information is stored and retrieved.

In your exam, a clear explanation that uses a concrete analogy like this, followed by the technical definition, will score well even if you cannot remember every detail.

Note: This is a demo response. The live AI backend running on the Barkla GPU cluster would generate an explanation grounded in the specific passage you selected from your lecture.`
};

export function getDemoTutorResponse(question, course) {
  const q = question.toLowerCase();
  const responses = DEMO_TUTOR_RESPONSES[course] || DEMO_TUTOR_RESPONSES.COMP516;
  for (const r of responses) {
    if (r.trigger.some(t => q.includes(t))) {
      return { answer: r.answer, sources: r.sources, demo: true };
    }
  }
  // Generic fallback
  return {
    answer: `This is a demo response for the question: "${question}"

With the live Mistral 7B backend running on the University's Barkla GPU cluster, this question would be answered by retrieving the most relevant chunks from your real ${course} lecture material (3,249 chunks are indexed across COMP516 and COMP315), and generating a grounded answer that cites the specific lecture it came from.

To see a live answer: the backend needs to be started on the Barkla visualisation node and tunnelled to your local machine.`,
    sources: ["demo-mode"],
    demo: true
  };
}

export function getDemoSolveResponse(mode) {
  return {
    answer: DEMO_SOLVE_RESPONSES[mode] || DEMO_SOLVE_RESPONSES.explain,
    sources: ["demo-mode"],
    demo: true
  };
}
