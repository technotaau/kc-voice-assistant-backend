const { VoiceService } = require('../voiceService');

test('hello world!', () => {
	expect(VoiceService.someFunction()).toBe('expectedValue');
});