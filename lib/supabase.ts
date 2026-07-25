// File ini ditambahkan sementara untuk mencegah error "Module not found"
// karena Supabase telah dihapus dalam proses migrasi ke MySQL.
// Ini adalah mock/dummy object agar aplikasi bisa dicompile.

export const supabase = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase dihapus') }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table: string) => ({
    select: () => ({ 
      order: async () => ({ data: [], error: null }),
      eq: async () => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null })
    }),
    insert: () => ({ 
      select: async () => ({ data: [{ id: Date.now() }], error: null }),
      error: null
    }),
    update: () => ({ 
      eq: () => ({ 
        select: async () => ({ data: [{ id: Date.now() }], error: null }),
        error: null 
      }) 
    }),
    delete: () => ({ 
      eq: async () => ({ error: null }) 
    })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/150' } })
    })
  }
};
