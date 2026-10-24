<?php require_once __DIR__ . '/../includes/personnel-guard.php'; ?>
    </main>
  </div>
  <script src="../script/supabase-client.js"></script>
  <script src="../script/personnel-shared.js"></script>
  <?php if (!empty($personnelScript)): ?>
    <script src="<?= htmlspecialchars($personnelScript, ENT_QUOTES, 'UTF-8') ?>"></script>
  <?php endif; ?>
</body>
</html>
