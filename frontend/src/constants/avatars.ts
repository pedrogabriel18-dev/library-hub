export interface AvatarCategory {
  id: string
  label: string
}

export interface AvatarItem {
  id: string
  category: string
  name: string
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  { id: 'all', label: 'Todos' },
  { id: 'fantasy', label: 'Fantasia' },
  { id: 'tech', label: 'Tecnologia' },
  { id: 'careers', label: 'Profissões' },
  { id: 'animals', label: 'Animais' },
  { id: 'scifi', label: 'Ficção Científica' },
  { id: 'general', label: 'Geral' },
]

export const AVATARS_WITH_CATEGORIES: AvatarItem[] = [
  // Fantasia
  { id: 'black-wizard-student-avatar-pixe', category: 'fantasy', name: 'Mago Negro' },
  { id: 'witch-student-avatar-pixel-art', category: 'fantasy', name: 'Bruxa' },
  { id: 'young-wizard-student-pixel-art', category: 'fantasy', name: 'Mago Jovem' },
  { id: 'fantasy-knight-girl-avatar-pixel', category: 'fantasy', name: 'Cavaleira de Fantasia' },
  { id: 'knight-student-avatar-pixel-art', category: 'fantasy', name: 'Cavaleiro Estudante' },
  { id: 'medieval-warrior-student-avatar', category: 'fantasy', name: 'Guerreiro Medieval' },
  { id: 'friendly-druid-student-avatar', category: 'fantasy', name: 'Druida Amigável' },
  { id: 'student-monk-pixel-art-avatar', category: 'fantasy', name: 'Monge Estudante' },
  { id: 'student-king-avatar-pixel-art', category: 'fantasy', name: 'Rei Estudante' },
  { id: 'student-queen-avatar-pixel-art', category: 'fantasy', name: 'Rainha Estudante' },
  { id: 'viking-student-avatar-pixel-art', category: 'fantasy', name: 'Viking Estudante' },
  { id: 'tribal-warrior-student-avatar-pi', category: 'fantasy', name: 'Guerreiro Tribal' },
  { id: 'samurai-student-avatar-pixel-art', category: 'fantasy', name: 'Samurai Estudante' },
  { id: 'cute-ghost-student-avatar-pixel', category: 'fantasy', name: 'Fantasma Fofo' },
  { id: 'cartoon-vampire-student-avatar', category: 'fantasy', name: 'Vampiro Desenho' },
  { id: 'female-vampire-student-avatar-pi', category: 'fantasy', name: 'Vampira' },
  { id: 'cartoon-zombie-student-avatar', category: 'fantasy', name: 'Zumbi Desenho' },
  { id: 'female-archer-avatar-pixel-art', category: 'fantasy', name: 'Arqueira' },
  { id: 'pirate-student-avatar-pixel-art', category: 'fantasy', name: 'Pirata' },
  { id: 'female-student-superhero-avatar', category: 'fantasy', name: 'Super-Heroína' },
  { id: 'student-superhero-avatar-pixel-art', category: 'fantasy', name: 'Super-Herói' },

  // Tecnologia
  { id: 'hacker-student-avatar-pixel-art', category: 'tech', name: 'Hacker' },
  { id: 'robot-student-avatar-pixel-art', category: 'tech', name: 'Robô Clássico' },
  { id: 'robot-student-avatar-pink-silver', category: 'tech', name: 'Robô Rosa/Prata' },
  { id: 'female-android-student-avatar-pi', category: 'tech', name: 'Androide' },
  { id: 'golden-robot-student-avatar', category: 'tech', name: 'Robô Dourado' },
  { id: 'student-avatar-wearing-neon-mask', category: 'tech', name: 'Máscara Neon' },
  { id: 'dj-student-avatar-glowing-headph', category: 'tech', name: 'DJ Headphone' },
  { id: 'male-dj-student-avatar-pixel', category: 'tech', name: 'DJ Pixel' },

  // Ficção Científica
  { id: 'alien-student-avatar-pixel-art', category: 'scifi', name: 'Alien' },
  { id: 'female-astronaut-student-avatar', category: 'scifi', name: 'Astronauta' },
  { id: 'female-space-knight-avatar-pixel', category: 'scifi', name: 'Cavaleiro do Espaço' },
  { id: 'space-guardian-student-avatar-pi', category: 'scifi', name: 'Guardião Espacial' },
  { id: 'young-space-explorer-avatar-pixe', category: 'scifi', name: 'Explorador Espacial' },

  // Profissões
  { id: 'doctor-student-avatar-pixel-art', category: 'careers', name: 'Médico' },
  { id: 'female-firefighter-student-avatar', category: 'careers', name: 'Bombeira' },
  { id: 'female-inventor-student-avatar', category: 'careers', name: 'Inventora' },
  { id: 'mechanic-student-avatar-pixel-art', category: 'careers', name: 'Mecânico' },
  { id: 'school-librarian-avatar-pixel-art', category: 'careers', name: 'Bibliotecária' },
  { id: 'student-detective-avatar-pixel-art', category: 'careers', name: 'Detetive' },
  { id: 'young-scientist-avatar-pixel-art', category: 'careers', name: 'Cientista' },
  { id: 'black-scientist-student-avatar-p', category: 'careers', name: 'Cientista Negro' },
  { id: 'racing-pilot-student-avatar-pixe', category: 'careers', name: 'Piloto de Corrida' },
  { id: 'musician-student-avatar-pixel-art', category: 'careers', name: 'Músico' },
  { id: 'masked-drummer-pixel-art-portrait', category: 'careers', name: 'Baterista Mascarado' },

  // Animais
  { id: 'cat-student-avatar-pixel-art', category: 'animals', name: 'Gato Estudante' },
  { id: 'cat-girl-student-avatar-pixel', category: 'animals', name: 'Garota Gato' },
  { id: 'humanoid-dragon-student-avatar', category: 'animals', name: 'Dragão Humanoide' },
  { id: 'humanoid-fox-student-avatar', category: 'animals', name: 'Raposa Humanoide' },
  { id: 'owl-scholar-avatar-pixel-art', category: 'animals', name: 'Coruja Erudita' },

  // Geral
  { id: 'young-explorer-student-avatar-pi', category: 'general', name: 'Explorador Jovem' },
  { id: 'ninja-student-avatar-pixel-art', category: 'general', name: 'Ninja' },
]
